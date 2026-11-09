// js/presets.js - Curated Security Audit, Bug Bounty & OSINT Templates

export const PRESET_CATEGORIES = [
    { id: 'all', label: 'All Templates', icon: '⚡' },
    { id: 'credentials', label: 'Credentials & Keys', icon: '🔑' },
    { id: 'portals', label: 'Admin & Portals', icon: '🚪' },
    { id: 'config', label: 'Config & Env Files', icon: '⚙️' },
    { id: 'directories', label: 'Directory Traversal', icon: '📁' },
    { id: 'backups', label: 'Backups & Dumps', icon: '💾' },
    { id: 'cloud', label: 'Cloud Storage & Buckets', icon: '☁️' },
    { id: 'logs', label: 'Logs & Debug Data', icon: '📜' },
    { id: 'iot', label: 'IoT & Webcams', icon: '📹' },
    { id: 'documents', label: 'Confidential Docs', icon: '📄' }
];

export const PRESETS_DATA = [
    // 🔑 Credentials & Keys
    {
        id: 'env-passwords',
        category: 'credentials',
        title: 'Environment & Secrets (.env)',
        description: 'Find exposed .env files disclosing database passwords, API tokens and keys.',
        query: 'site:{target} (filetype:env OR filetype:yaml OR filetype:yml) "DB_PASSWORD" OR "SECRET_KEY"',
        severity: 'Critical'
    },
    {
        id: 'sql-dumps-passwords',
        category: 'credentials',
        title: 'SQL Database Password Dumps',
        description: 'Locate SQL export files containing password hashes, users, or credentials.',
        query: 'site:{target} filetype:sql ("password" OR "passwd" OR "admin" OR "hash")',
        severity: 'Critical'
    },
    {
        id: 'ssh-private-keys',
        category: 'credentials',
        title: 'Leaked Private RSA/OpenSSH Keys',
        description: 'Detect public SSH private keys accidentally hosted on web servers.',
        query: 'site:{target} (ext:key OR ext:pem OR ext:txt) "BEGIN RSA PRIVATE KEY"',
        severity: 'Critical'
    },
    {
        id: 'github-leaks',
        category: 'credentials',
        title: 'GitHub Organization Leaks',
        description: 'Audit GitHub repositories for target company credentials and secret keys.',
        query: 'site:github.com "{target}" ("api_key" OR "secret" OR "token" OR "password")',
        severity: 'High'
    },
    {
        id: 'pastebin-leaks',
        category: 'credentials',
        title: 'Pastebin / Text Dumps',
        description: 'Discover target mentions in pastes containing credentials or database leaks.',
        query: 'site:pastebin.com "{target}" ("password" OR "credential" OR "admin")',
        severity: 'Medium'
    },

    // 🚪 Admin & Portals
    {
        id: 'admin-logins',
        category: 'portals',
        title: 'Administrative Login Portals',
        description: 'Discover backend management panels, admin logins, and administrative portals.',
        query: 'site:{target} (inurl:admin OR inurl:login OR inurl:cpanel OR inurl:adminlogin)',
        severity: 'Medium'
    },
    {
        id: 'wp-admin-portals',
        category: 'portals',
        title: 'WordPress Admin Interfaces',
        description: 'Quickly find WordPress backend authentication endpoints.',
        query: 'site:{target} inurl:wp-login.php OR inurl:wp-admin',
        severity: 'Low'
    },
    {
        id: 'db-management-tools',
        category: 'portals',
        title: 'Web Database Managers (phpMyAdmin / Adminer)',
        description: 'Locate exposed database web interfaces like phpMyAdmin, Adminer, or Mongo Express.',
        query: 'site:{target} (inurl:phpmyadmin OR inurl:pma OR inurl:adminer OR intitle:"phpMyAdmin")',
        severity: 'High'
    },
    {
        id: 'dashboard-panels',
        category: 'portals',
        title: 'Internal Dashboards & Control Panels',
        description: 'Find internal metric dashboards, monitoring tools, or management portals.',
        query: 'site:{target} intitle:"Dashboard" OR intitle:"Admin Panel" OR intitle:"Control Center"',
        severity: 'Medium'
    },

    // ⚙️ Config & Env Files
    {
        id: 'wp-config-files',
        category: 'config',
        title: 'WordPress Config Backups (wp-config)',
        description: 'Find exposed wp-config.php backup files containing database credentials.',
        query: 'site:{target} inurl:wp-config.php.bak OR inurl:wp-config.old OR inurl:wp-config.txt',
        severity: 'Critical'
    },
    {
        id: 'git-repo-exposure',
        category: 'config',
        title: 'Exposed .git Folder',
        description: 'Identify public .git repositories allowing full source code extraction.',
        query: 'site:{target} inurl:"/.git" intitle:"Index of /.git"',
        severity: 'Critical'
    },
    {
        id: 'web-config-xml',
        category: 'config',
        title: 'IIS web.config & XML Configurations',
        description: 'Locate IIS or ASP.NET web.config files exposing connection strings.',
        query: 'site:{target} filetype:config inurl:web.config "connectionStrings"',
        severity: 'High'
    },
    {
        id: 'phpinfo-exposure',
        category: 'config',
        title: 'Exposed phpinfo() Diagnostic Pages',
        description: 'Detect diagnostic scripts revealing PHP versions, extensions, and server environment.',
        query: 'site:{target} (filetype:php OR filetype:html) "phpinfo()" "PHP Version"',
        severity: 'Medium'
    },

    // 📁 Directory Traversal & Index Of
    {
        id: 'index-of-root',
        category: 'directories',
        title: 'Open Directory Listings (Index of /)',
        description: 'Find web servers with directory browsing enabled listing server files.',
        query: 'site:{target} intitle:"index of /"',
        severity: 'Medium'
    },
    {
        id: 'index-of-sensitive',
        category: 'directories',
        title: 'Index of Sensitive Folders',
        description: 'Pinpoint directory listings for backups, databases, private keys or archives.',
        query: 'site:{target} intitle:"index of /" (backup OR database OR dump OR logs OR private OR certs)',
        severity: 'High'
    },

    // 💾 Backups & Dumps
    {
        id: 'database-dumps-all',
        category: 'backups',
        title: 'Database Export & Dump Files',
        description: 'Search for common database backup extensions (.sql, .db, .dump, .sqlite).',
        query: 'site:{target} (filetype:sql OR filetype:db OR filetype:sqlite OR filetype:dump)',
        severity: 'Critical'
    },
    {
        id: 'compressed-backups',
        category: 'backups',
        title: 'Compressed Website & Code Backups',
        description: 'Search for compressed archives (.zip, .tar.gz, .bak, .7z) of web roots.',
        query: 'site:{target} (filetype:zip OR filetype:tar.gz OR filetype:tgz OR filetype:bak) "backup"',
        severity: 'High'
    },

    // ☁️ Cloud Storage & Buckets
    {
        id: 's3-buckets-target',
        category: 'cloud',
        title: 'AWS S3 Buckets Exposure',
        description: 'Discover public Amazon S3 storage buckets containing target assets or files.',
        query: 'site:s3.amazonaws.com "{target}"',
        severity: 'High'
    },
    {
        id: 'azure-blob-target',
        category: 'cloud',
        title: 'Azure Blob Storage Containers',
        description: 'Locate public Microsoft Azure storage blobs matching the target organization.',
        query: 'site:blob.core.windows.net "{target}"',
        severity: 'High'
    },
    {
        id: 'gcs-target',
        category: 'cloud',
        title: 'Google Cloud Storage Buckets',
        description: 'Audit Google Cloud Storage endpoints for target company data.',
        query: 'site:storage.googleapis.com "{target}"',
        severity: 'High'
    },
    {
        id: 'firebase-target',
        category: 'cloud',
        title: 'Exposed Firebase Realtime Databases',
        description: 'Find open Firebase databases with readable JSON endpoints.',
        query: 'site:firebaseio.com "{target}"',
        severity: 'Critical'
    },

    // 📜 Logs & Debug Data
    {
        id: 'app-logs-errors',
        category: 'logs',
        title: 'Server & Application Error Logs',
        description: 'Detect exposed .log files disclosing stack traces, errors, or sensitive queries.',
        query: 'site:{target} (filetype:log OR filetype:txt) ("fatal error" OR "stack trace" OR "uncaught exception")',
        severity: 'Medium'
    },
    {
        id: 'django-debug-traces',
        category: 'logs',
        title: 'Django / Flask Debug Mode',
        description: 'Find Python web applications in debug mode exposing internal variables and code.',
        query: 'site:{target} ("DisallowedHost at /" OR "OperationalError at /" OR "Traceback (most recent call last)")',
        severity: 'High'
    },

    // 📹 IoT & Webcams
    {
        id: 'axis-network-cameras',
        category: 'iot',
        title: 'Axis Network Security Cameras',
        description: 'Identify exposed Axis network video surveillance camera interfaces.',
        query: 'intitle:"Live View / - AXIS" OR inurl:view/index.shtml',
        severity: 'Low'
    },
    {
        id: 'webcam-generic-streams',
        category: 'iot',
        title: 'Public Webcam Video Streams',
        description: 'Locate generic webcams streaming live feeds without authentication.',
        query: 'inurl:"ViewerFrame?Mode=" OR inurl:"/view/viewer_index.shtml"',
        severity: 'Low'
    },

    // 📄 Confidential Docs
    {
        id: 'confidential-docs',
        category: 'documents',
        title: 'Confidential Internal Documents',
        description: 'Search for PDF or Office documents marked confidential, private or internal.',
        query: 'site:{target} (filetype:pdf OR filetype:docx OR filetype:xlsx) ("confidential" OR "internal use only" OR "strictly private")',
        severity: 'High'
    },
    {
        id: 'financial-invoices-payroll',
        category: 'documents',
        title: 'Financial Records, Invoices & Payrolls',
        description: 'Find exposed spreadsheets containing budget, payroll, or customer billing data.',
        query: 'site:{target} (filetype:xlsx OR filetype:csv OR filetype:pdf) ("payroll" OR "invoice" OR "balance sheet")',
        severity: 'High'
    }
];

/**
 * Format preset query with a target domain
 * @param {string} rawQuery
 * @param {string} targetDomain
 * @returns {string}
 */
export function formatPresetQuery(rawQuery, targetDomain = '') {
    const cleanDomain = targetDomain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    if (cleanDomain) {
        return rawQuery.replace(/{target}/g, cleanDomain);
    }
    // If no target provided, clean out `site:{target}` cleanly
    return rawQuery
        .replace(/site:{target}\s*/g, '')
        .replace(/"{target}"\s*/g, '')
        .trim();
}
