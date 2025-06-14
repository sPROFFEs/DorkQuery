#!/usr/bin/env python3
"""
Script para extraer todas las entradas de Google Hacking Database (GHDB) de Exploit-DB
Versión compatible con Python 3.13 usando solo bibliotecas estándar
"""

import urllib.request
import urllib.parse
import json
import time
import sys
import http.cookiejar
import re

class GHDBExtractor:
    def __init__(self):
        self.base_url = "https://www.exploit-db.com/google-hacking-database"
        
        # Configurar cookie jar
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookie_jar))
        
        # Headers basados en tu ejemplo
        self.headers = {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en;q=0.6',
            'DNT': '1',
            'Priority': 'u=1, i',
            'Referer': 'https://www.exploit-db.com/google-hacking-database',
            'Sec-CH-UA': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-GPC': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        }
        
        # Parámetros base para la query
        self.base_params = {
            'draw': '1',
            'columns[0][data]': 'date',
            'columns[0][name]': 'date',
            'columns[0][searchable]': 'true',
            'columns[0][orderable]': 'true',
            'columns[0][search][value]': '',
            'columns[0][search][regex]': 'false',
            'columns[1][data]': 'url_title',
            'columns[1][name]': 'url_title',
            'columns[1][searchable]': 'true',
            'columns[1][orderable]': 'false',
            'columns[1][search][value]': '',
            'columns[1][search][regex]': 'false',
            'columns[2][data]': 'cat_id',
            'columns[2][name]': 'cat_id',
            'columns[2][searchable]': 'true',
            'columns[2][orderable]': 'false',
            'columns[2][search][value]': '',
            'columns[2][search][regex]': 'false',
            'columns[3][data]': 'author_id',
            'columns[3][name]': 'author_id',
            'columns[3][searchable]': 'false',
            'columns[3][orderable]': 'false',
            'columns[3][search][value]': '',
            'columns[3][search][regex]': 'false',
            'order[0][column]': '0',
            'order[0][dir]': 'desc',
            'search[value]': '',
            'search[regex]': 'false',
            'author': '',
            'category': '',
            '_': str(int(time.time() * 1000))
        }

    def get_initial_cookies(self):
        """Obtiene las cookies necesarias visitando primero la página principal"""
        try:
            req = urllib.request.Request('https://www.exploit-db.com/google-hacking-database')
            for key, value in self.headers.items():
                req.add_header(key, value)
            
            response = self.opener.open(req, timeout=30)
            print(f"✓ Cookies obtenidas: {len(self.cookie_jar)} cookies")
            return True
        except Exception as e:
            print(f"✗ Error obteniendo cookies: {e}")
            return False

    def fetch_page(self, start, length=100):
        """Obtiene una página de datos de GHDB"""
        params = self.base_params.copy()
        params['start'] = str(start)
        params['length'] = str(length)
        params['_'] = str(int(time.time() * 1000))  # Actualizar timestamp
        
        try:
            # Construir URL con parámetros
            url = f"{self.base_url}?{urllib.parse.urlencode(params)}"
            
            req = urllib.request.Request(url)
            for key, value in self.headers.items():
                req.add_header(key, value)
            
            response = self.opener.open(req, timeout=30)
            
            if response.getcode() == 200:
                # Leer y decodificar la respuesta
                content = response.read()
                
                # Manejar compresión gzip
                if response.info().get('Content-Encoding') == 'gzip':
                    import gzip
                    content = gzip.decompress(content)
                
                data = json.loads(content.decode('utf-8'))
                return data
            else:
                print(f"✗ Error HTTP {response.getcode()} para start={start}")
                return None
                
        except Exception as e:
            print(f"✗ Error en request para start={start}: {e}")
            return None

    def extract_all_entries(self, batch_size=100, delay=1):
        """Extrae todas las entradas de GHDB"""
        print("🔍 Iniciando extracción de GHDB...")
        
        # Obtener cookies primero
        if not self.get_initial_cookies():
            return None
        
        all_entries = []
        start = 0
        total_records = None
        
        while True:
            print(f"📥 Obteniendo registros {start} - {start + batch_size}...")
            
            data = self.fetch_page(start, batch_size)
            
            if not data:
                print(f"✗ No se pudieron obtener datos para start={start}")
                break
            
            # En la primera iteración, obtener el total de registros
            if total_records is None:
                total_records = data.get('recordsTotal', 0)
                print(f"📊 Total de registros disponibles: {total_records}")
            
            # Obtener las entradas de esta página
            entries = data.get('data', [])
            
            if not entries:
                print("✓ No hay más entradas disponibles")
                break
            
            all_entries.extend(entries)
            print(f"✓ Obtenidos {len(entries)} registros. Total acumulado: {len(all_entries)}")
            
            # Si hemos obtenido todos los registros, terminar
            if len(all_entries) >= total_records:
                print("✓ Todos los registros obtenidos")
                break
            
            # Actualizar start para la siguiente página
            start += batch_size
            
            # Delay para no sobrecargar el servidor
            time.sleep(delay)
        
        print(f"🎉 Extracción completada: {len(all_entries)} entradas obtenidas")
        return {
            'total_records': total_records,
            'extracted_records': len(all_entries),
            'entries': all_entries,
            'extraction_timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }

    def clean_entry(self, entry):
        """Limpia una entrada individual extrayendo información útil"""
        cleaned = {
            'id': entry.get('id'),
            'date': entry.get('date'),
            'category': entry.get('category', {}).get('cat_title', '') if isinstance(entry.get('category'), dict) else '',
            'category_id': entry.get('category', {}).get('cat_id', '') if isinstance(entry.get('category'), dict) else '',
            'author': entry.get('author', {}).get('name', '') if isinstance(entry.get('author'), dict) else '',
            'author_id': entry.get('author', {}).get('id', '') if isinstance(entry.get('author'), dict) else '',
        }
        
        # Extraer el título limpio del HTML
        url_title = entry.get('url_title', '')
        if url_title:
            # Extraer el texto entre las etiquetas <a>
            match = re.search(r'<a[^>]*>([^<]+)</a>', url_title)
            if match:
                cleaned['query'] = match.group(1)
            else:
                cleaned['query'] = url_title
        else:
            cleaned['query'] = ''
        
        # Extraer el ID del GHDB del href
        if url_title:
            href_match = re.search(r'href="[^"]*ghdb/(\d+)"', url_title)
            if href_match:
                cleaned['ghdb_id'] = href_match.group(1)
            else:
                cleaned['ghdb_id'] = cleaned['id']
        else:
            cleaned['ghdb_id'] = cleaned['id']
        
        return cleaned

    def save_results(self, data, filename='ghdb_export.json', clean=False):
        """Guarda los resultados en un archivo JSON"""
        try:
            if clean and 'entries' in data:
                # Limpiar las entradas
                cleaned_entries = [self.clean_entry(entry) for entry in data['entries']]
                data_to_save = {
                    'metadata': {
                        'total_records': data['total_records'],
                        'extracted_records': data['extracted_records'],
                        'extraction_timestamp': data['extraction_timestamp']
                    },
                    'entries': cleaned_entries
                }
            else:
                data_to_save = data
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data_to_save, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Datos guardados en: {filename}")
            return True
            
        except Exception as e:
            print(f"✗ Error guardando archivo: {e}")
            return False

    def print_sample_entries(self, data, num_samples=5):
        """Muestra algunas entradas de ejemplo"""
        if not data or 'entries' not in data:
            return
        
        print(f"\n📋 Mostrando {min(num_samples, len(data['entries']))} entradas de ejemplo:")
        print("-" * 80)
        
        for i, entry in enumerate(data['entries'][:num_samples]):
            cleaned = self.clean_entry(entry)
            print(f"#{i+1} ID: {cleaned['id']} | Fecha: {cleaned['date']}")
            print(f"    Query: {cleaned['query']}")
            print(f"    Categoría: {cleaned['category']}")
            print(f"    Autor: {cleaned['author']}")
            print("-" * 80)

def main():
    print("=" * 60)
    print("🕵️  GHDB Extractor - Google Hacking Database")
    print("    Versión compatible con Python 3.13")
    print("=" * 60)
    
    extractor = GHDBExtractor()
    
    # Extraer todas las entradas
    results = extractor.extract_all_entries(batch_size=100, delay=1)
    
    if results:
        # Mostrar algunas entradas de ejemplo
        extractor.print_sample_entries(results, num_samples=3)
        
        # Guardar versión completa (raw)
        extractor.save_results(results, 'ghdb_complete.json', clean=False)
        
        # Guardar versión limpia
        extractor.save_results(results, 'ghdb_clean.json', clean=True)
        
        print("\n📈 Resumen de la extracción:")
        print(f"   • Total de registros: {results['total_records']}")
        print(f"   • Registros extraídos: {results['extracted_records']}")
        print(f"   • Archivos generados:")
        print(f"     - ghdb_complete.json (datos completos)")
        print(f"     - ghdb_clean.json (datos procesados)")
        
        # Mostrar estadísticas por categoría
        if results['entries']:
            categories = {}
            for entry in results['entries']:
                cat = entry.get('category', {})
                if isinstance(cat, dict):
                    cat_name = cat.get('cat_title', 'Sin categoría')
                    categories[cat_name] = categories.get(cat_name, 0) + 1
            
            print(f"\n📊 Distribución por categorías:")
            for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"   • {cat}: {count} entradas")
    else:
        print("✗ La extracción falló")
        sys.exit(1)

if __name__ == "__main__":
    main()
