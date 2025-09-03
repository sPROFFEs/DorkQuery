# DorkQuery - Guía de Actualización de Base de Datos

Esta guía explica cómo actualizar las bases de datos de dorks en DorkQuery, que ahora incluye tanto GHDB como DorkHub.

## 📊 Base de Datos Actual

- **Total de dorks**: 909,256
- **Fuentes**:
  - **GHDB (Google Hacking Database)**: 7,944 dorks
  - **DorkHub (TrixSec)**: 901,312 dorks
- **Categorías**: 22+ categorías diferentes
- **Archivo principal**: `data/unified_dorks.json`

## 🔄 Proceso de Actualización

### 1. Actualizar GHDB

```bash
cd data/
python3 ghdb_extractor.py
```

Esto generará:
- `ghdb_complete.json` - Datos completos de GHDB
- `ghdb_clean.json` - Datos procesados de GHDB

### 2. Actualizar DorkHub

**Paso 2.1: Descargar DorkHub**
```bash
# Descargar la última versión de DorkHub
curl -L -o DorkHub-main.zip https://github.com/TrixSec/DorkHub/archive/refs/heads/main.zip
unzip DorkHub-main.zip
```

**Paso 2.2: Procesar DorkHub**
```bash
cd data/
python3 dorkhub_parser.py
```

Esto generará:
- `dorkhub_clean.json` - Solo dorks de DorkHub
- `unified_dorks.json` - **Base de datos unificada (GHDB + DorkHub)**

### 3. Verificar Actualización

La webapp debería mostrar automáticamente:
- Nuevas estadísticas en el título
- Filtros actualizados por categoría y fuente
- Nuevos dorks disponibles para búsqueda

## 📁 Estructura de Archivos

```
data/
├── ghdb_extractor.py      # Extractor de GHDB
├── dorkhub_parser.py      # Parser de DorkHub
├── ghdb_clean.json        # Solo GHDB (7,944 entradas)
├── dorkhub_clean.json     # Solo DorkHub (901,312 entradas)
└── unified_dorks.json     # Base unificada (909,256 entradas) ⭐
```

## 🎯 Archivos Principales

- **`unified_dorks.json`**: Archivo principal que usa la webapp
- **`ghdb_clean.json`**: Backup de datos de GHDB
- **`dorkhub_clean.json`**: Backup de datos de DorkHub

## ⚙️ Scripts Disponibles

### ghdb_extractor.py
Extrae dorks de la Google Hacking Database de Exploit-DB.

**Características**:
- Manejo de rate limiting
- Cookies automáticas
- Datos limpios y categorizados
- Compatible con Python 3.13

### dorkhub_parser.py
Procesa el repositorio DorkHub local.

**Características**:
- Análisis de 22 categorías
- Filtrado inteligente de contenido
- Generación de archivo unificado
- Estadísticas detalladas por categoría y archivo

## 🔍 Frecuencia Recomendada

- **GHDB**: Cada 1-2 meses (se actualiza menos frecuentemente)
- **DorkHub**: Cada 2-4 semanas (más activo)
- **Combinado**: Según necesidad o cuando notes cambios significativos

## 🚀 Despliegue

Después de actualizar:

1. **Desarrollo local**: Los cambios se reflejan inmediatamente
2. **GitHub Pages**: Hacer commit y push de los archivos JSON actualizados
3. **Otros hosting**: Subir los archivos JSON a la carpeta `data/`

## 📋 Checklist de Actualización

- [ ] Ejecutar `python3 ghdb_extractor.py`
- [ ] Descargar última versión de DorkHub
- [ ] Ejecutar `python3 dorkhub_parser.py`
- [ ] Verificar que `unified_dorks.json` existe y tiene tamaño correcto
- [ ] Probar webapp localmente
- [ ] Hacer commit de los archivos actualizados (opcional)

## ⚠️ Notas Importantes

- Los archivos JSON pueden ser grandes (300MB+)
- El `.gitignore` está configurado para excluir archivos temporales de Python
- El repositorio DorkHub-main/ está excluido del git
- Si subes a GitHub, considera si quieres incluir los archivos JSON grandes

## 📞 Soporte

Si encuentras problemas:
1. Verifica que Python 3.x esté instalado
2. Revisa los logs de los scripts
3. Asegúrate de tener conexión a internet para GHDB
4. Verifica que DorkHub-main/ exista para el parser local

---

**Fuentes de datos**:
- [Google Hacking Database (GHDB)](https://www.exploit-db.com/google-hacking-database)
- [TrixSec DorkHub](https://github.com/TrixSec/DorkHub)