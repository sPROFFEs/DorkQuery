#!/usr/bin/env python3
"""
Parser local para DorkHub - Analiza archivos .txt del repositorio DorkHub descargado
Convierte los dorks a formato JSON compatible con el sistema existente de GHDB
"""

import os
import json
import time
import sys
import gzip
from typing import Dict, List, Tuple
import re

class DorkHubParser:
    def __init__(self, dorkhub_path: str = "../DorkHub-main"):
        self.dorkhub_path = os.path.abspath(dorkhub_path)
        self.category_mapping = {
            'Backlink dorks': 'Backlink',
            'Bug Bounty Dorks': 'Bug Bounty',
            'Carding dorks': 'Carding',
            'CCTV': 'CCTV',
            'Censys dorks': 'Censys',
            'Cloud Instance Dorks': 'Cloud Services',
            'CMS': 'CMS',
            'Cryptocurrency Dorks': 'Cryptocurrency',
            'Gaming Dorks': 'Gaming', 
            'Github Dorks': 'GitHub',
            'LFI': 'LFI',
            'Misc': 'Miscellaneous',
            'Movie Dorks': 'Entertainment',
            'Onion Dorks': 'Dark Web',
            'RFI': 'RFI',
            'Search Engines Dorks': 'Search Engines',
            'Shodan Dorks': 'Shodan',
            'Shopping Dorks': 'E-commerce',
            'Social Media Dorks': 'Social Media',
            'SQLi': 'SQL Injection',
            'Virus Total dorks': 'Virus Total',
            'XSS': 'XSS'
        }
        
    def find_category_directories(self) -> List[str]:
        """Encuentra todos los directorios de categorías en DorkHub"""
        if not os.path.exists(self.dorkhub_path):
            print(f"✗ No se encuentra el directorio DorkHub en: {self.dorkhub_path}")
            return []
        
        categories = []
        for item in os.listdir(self.dorkhub_path):
            item_path = os.path.join(self.dorkhub_path, item)
            if os.path.isdir(item_path) and item in self.category_mapping:
                categories.append(item)
        
        print(f"✓ Encontradas {len(categories)} categorías: {', '.join(categories)}")
        return categories

    def clean_dork_line(self, line: str) -> str:
        """Limpia y procesa una línea de dork"""
        line = line.strip()
        
        # Saltar líneas vacías y comentarios
        if (not line or 
            line.startswith('#') or 
            line.startswith('//') or
            line.startswith('/*') or
            line.endswith('*/') or
            line.startswith('=') or
            line.startswith('-') or
            line.lower().startswith('search') or
            line.lower().startswith('description') or
            line.lower().startswith('note:') or
            line.lower().startswith('info:') or
            'Google Dork' in line or
            'google dork' in line):
            return None
        
        # Procesar líneas con formato "dork : descripción"
        if ':' in line and not line.startswith('http'):
            parts = line.split(':', 1)
            if len(parts) >= 2:
                dork_part = parts[0].strip()
                description_part = parts[1].strip()
                
                # Si la parte izquierda parece un dork, usarla
                if (dork_part and 
                    (dork_part.startswith('"') or 
                     any(keyword in dork_part.lower() for keyword in 
                         ['site:', 'inurl:', 'intitle:', 'filetype:', 'intext:', 'ext:', 'cache:', 'filename:', 'package']))):
                    return dork_part.strip('"').strip()
                
                # Si no, revisar si la descripción es realmente el dork
                if (description_part and
                    any(keyword in description_part.lower() for keyword in 
                        ['site:', 'inurl:', 'intitle:', 'filetype:', 'intext:', 'ext:', 'cache:', 'filename:'])):
                    return description_part.strip('"').strip()
        
        # Limpiar comillas excesivas y espacios
        cleaned = line.strip('"').strip("'").strip()
        
        # Verificar si parece un dork válido
        if cleaned and len(cleaned) > 2:
            return cleaned
        
        return None

    def parse_dork_file(self, file_path: str, category: str, subcategory: str) -> List[Dict]:
        """Analiza un archivo de dorks y devuelve una lista de entradas"""
        dorks = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            lines = content.split('\n')
            
            for line_num, line in enumerate(lines, 1):
                cleaned_dork = self.clean_dork_line(line)
                
                if cleaned_dork:
                    entry = {
                        'id': f"dh_{len(dorks) + 1}",
                        'query': cleaned_dork,
                        'category': self.category_mapping.get(category, category),
                        'subcategory': subcategory,
                        'source': 'DorkHub',
                        'source_file': os.path.basename(file_path),
                        'ghdb_id': None,
                        'date': time.strftime('%Y-%m-%d'),
                        'author': 'TrixSec/DorkHub',
                        'author_id': 'dorkhub'
                    }
                    dorks.append(entry)
            
            return dorks
            
        except Exception as e:
            print(f"✗ Error procesando {file_path}: {e}")
            return []

    def parse_all_categories(self) -> Dict:
        """Analiza todas las categorías y archivos de DorkHub"""
        print("🔍 Iniciando análisis local de DorkHub...")
        
        categories = self.find_category_directories()
        if not categories:
            return None
        
        all_dorks = []
        categories_stats = {}
        file_stats = {}
        
        for category in categories:
            category_path = os.path.join(self.dorkhub_path, category)
            print(f"\n📂 Procesando categoría: {category}")
            
            # Encontrar todos los archivos .txt en la categoría
            txt_files = []
            for file in os.listdir(category_path):
                if file.endswith('.txt'):
                    txt_files.append(file)
            
            if not txt_files:
                print(f"   ⚠️  No se encontraron archivos .txt en {category}")
                categories_stats[category] = 0
                continue
            
            print(f"   📋 Encontrados {len(txt_files)} archivos: {', '.join(txt_files)}")
            
            category_dorks = []
            
            for txt_file in txt_files:
                file_path = os.path.join(category_path, txt_file)
                subcategory = txt_file.replace('.txt', '')
                
                print(f"   📥 Procesando {txt_file}...")
                
                file_dorks = self.parse_dork_file(file_path, category, subcategory)
                
                if file_dorks:
                    print(f"      ✓ {len(file_dorks)} dorks extraídos")
                    category_dorks.extend(file_dorks)
                    all_dorks.extend(file_dorks)
                    file_stats[f"{category}/{txt_file}"] = len(file_dorks)
                else:
                    print(f"      ⚠️  No se pudieron extraer dorks de {txt_file}")
                    file_stats[f"{category}/{txt_file}"] = 0
            
            categories_stats[category] = len(category_dorks)
            print(f"   ✓ Total de dorks en {category}: {len(category_dorks)}")
        
        # Re-numerar IDs globalmente
        for i, dork in enumerate(all_dorks, 1):
            dork['id'] = f"dh_{i}"
        
        result = {
            'total_records': len(all_dorks),
            'extracted_records': len(all_dorks),
            'categories_count': len(categories),
            'categories_stats': categories_stats,
            'file_stats': file_stats,
            'entries': all_dorks,
            'extraction_timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'source': 'TrixSec/DorkHub (Local)',
            'dorkhub_path': self.dorkhub_path
        }
        
        print(f"\n🎉 Análisis completado: {len(all_dorks)} dorks de {len(categories)} categorías")
        return result

    def save_results(self, data: Dict, filename: str = 'dorkhub_clean.json') -> bool:
        """Guarda los resultados en un archivo JSON comprimido"""
        try:
            # Formatear datos para que sean compatibles con el sistema existente
            formatted_data = {
                'metadata': {
                    'total_records': data['total_records'],
                    'extracted_records': data['extracted_records'],
                    'extraction_timestamp': data['extraction_timestamp'],
                    'source': data['source'],
                    'categories_count': data['categories_count'],
                    'categories_stats': data['categories_stats'],
                    'file_stats': data['file_stats'],
                    'dorkhub_path': data['dorkhub_path']
                },
                'entries': data['entries']
            }
            
            # Guardar comprimido directamente
            compressed_filename = filename + '.gz'
            with gzip.open(compressed_filename, 'wt', encoding='utf-8') as f:
                json.dump(formatted_data, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Datos guardados comprimidos en: {compressed_filename}")
            
            # También guardar sin comprimir para compatibilidad (opcional)
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(formatted_data, f, indent=2, ensure_ascii=False)
            print(f"💾 Datos también guardados sin comprimir en: {filename}")
            
            return True
            
        except Exception as e:
            print(f"✗ Error guardando archivo: {e}")
            return False

    def print_sample_entries(self, data: Dict, num_samples: int = 5):
        """Muestra algunas entradas de ejemplo"""
        if not data or 'entries' not in data:
            return
        
        print(f"\n📋 Mostrando {min(num_samples, len(data['entries']))} entradas de ejemplo:")
        print("-" * 80)
        
        for i, entry in enumerate(data['entries'][:num_samples]):
            print(f"#{i+1} ID: {entry['id']} | Fecha: {entry['date']}")
            print(f"    Query: {entry['query']}")
            print(f"    Categoría: {entry['category']} > {entry['subcategory']}")
            print(f"    Archivo: {entry['source_file']}")
            print(f"    Fuente: {entry['source']}")
            print("-" * 80)

    def print_statistics(self, data: Dict):
        """Muestra estadísticas detalladas del análisis"""
        print(f"\n📈 Estadísticas del análisis:")
        print(f"   • Total de registros: {data['total_records']}")
        print(f"   • Categorías procesadas: {data['categories_count']}")
        print(f"   • Ruta DorkHub: {data['dorkhub_path']}")
        
        print(f"\n📊 Distribución por categorías:")
        for category, count in sorted(data['categories_stats'].items(), 
                                     key=lambda x: x[1], reverse=True):
            mapped_name = self.category_mapping.get(category, category)
            print(f"   • {mapped_name} ({category}): {count} dorks")
        
        print(f"\n📁 Top 10 archivos con más dorks:")
        top_files = sorted(data['file_stats'].items(), key=lambda x: x[1], reverse=True)[:10]
        for file_path, count in top_files:
            print(f"   • {file_path}: {count} dorks")

def merge_with_ghdb(dorkhub_file: str = 'dorkhub_clean.json', 
                   ghdb_file: str = 'ghdb_clean.json', 
                   output_file: str = 'unified_dorks.json') -> bool:
    """Combina los datos de DorkHub con GHDB en un archivo unificado comprimido"""
    try:
        print(f"\n🔄 Combinando datos de DorkHub y GHDB...")
        
        # Cargar DorkHub
        with open(dorkhub_file, 'r', encoding='utf-8') as f:
            dorkhub_data = json.load(f)
        
        # Cargar GHDB si existe
        ghdb_entries = []
        if os.path.exists(ghdb_file):
            with open(ghdb_file, 'r', encoding='utf-8') as f:
                ghdb_data = json.load(f)
                raw_ghdb_entries = ghdb_data.get('entries', [])
            
            # Añadir campo 'source' a las entradas de GHDB que no lo tienen
            for entry in raw_ghdb_entries:
                if 'source' not in entry:
                    entry['source'] = 'GHDB'
                ghdb_entries.append(entry)
            
            print(f"   ✓ GHDB cargado: {len(ghdb_entries)} entradas")
        else:
            print(f"   ⚠️  Archivo GHDB no encontrado: {ghdb_file}")
        
        # Combinar entradas
        all_entries = dorkhub_data['entries'] + ghdb_entries
        
        # Crear archivo unificado
        unified_data = {
            'metadata': {
                'total_records': len(all_entries),
                'dorkhub_records': len(dorkhub_data['entries']),
                'ghdb_records': len(ghdb_entries),
                'extraction_timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'sources': ['TrixSec/DorkHub', 'Google Hacking Database'],
                'dorkhub_categories': dorkhub_data['metadata']['categories_count'],
                'dorkhub_stats': dorkhub_data['metadata']['categories_stats']
            },
            'entries': all_entries
        }
        
        # Guardar comprimido directamente
        compressed_output = output_file + '.gz'
        with gzip.open(compressed_output, 'wt', encoding='utf-8') as f:
            json.dump(unified_data, f, indent=2, ensure_ascii=False)
        
        # También guardar sin comprimir para compatibilidad
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(unified_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Datos combinados guardados comprimidos en: {compressed_output}")
        print(f"✓ Datos combinados guardados sin comprimir en: {output_file}")
        print(f"   • DorkHub: {len(dorkhub_data['entries'])} entradas")
        print(f"   • GHDB: {len(ghdb_entries)} entradas")
        print(f"   • Total: {len(all_entries)} entradas")
        
        return True
        
    except Exception as e:
        print(f"✗ Error combinando datos: {e}")
        return False

def main():
    print("=" * 60)
    print("🕵️  DorkHub Parser - Analizador local de repositorio")
    print("    Convierte archivos .txt a formato JSON compatible")
    print("=" * 60)
    
    # Intentar encontrar el directorio DorkHub
    possible_paths = [
        "../DorkHub-main",
        "./DorkHub-main", 
        "/mnt/d/Github/DorkQuery/DorkHub-main"
    ]
    
    dorkhub_path = None
    for path in possible_paths:
        if os.path.exists(path):
            dorkhub_path = path
            break
    
    if not dorkhub_path:
        print("✗ No se encontró el directorio DorkHub-main")
        print("   Asegúrate de que esté en uno de estos lugares:")
        for path in possible_paths:
            print(f"   • {path}")
        sys.exit(1)
    
    parser = DorkHubParser(dorkhub_path)
    
    # Analizar todos los archivos
    results = parser.parse_all_categories()
    
    if results:
        # Mostrar estadísticas
        parser.print_statistics(results)
        
        # Mostrar algunas entradas de ejemplo
        parser.print_sample_entries(results, num_samples=3)
        
        # Guardar resultados de DorkHub
        if parser.save_results(results, 'dorkhub_clean.json'):
            # Intentar combinar con GHDB existente
            merge_with_ghdb()
        
        print(f"\n✅ Proceso completado exitosamente")
        print(f"📁 Archivos generados:")
        print(f"   • dorkhub_clean.json(.gz) - Solo dorks de DorkHub")
        print(f"   • unified_dorks.json(.gz) - DorkHub + GHDB combinados")
        print(f"   Los archivos .gz están listos para usar en la webapp")
        
    else:
        print("✗ El análisis falló")
        sys.exit(1)

if __name__ == "__main__":
    main()