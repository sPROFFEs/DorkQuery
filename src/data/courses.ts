import { Course } from '../types';

export const courses: Course[] = [
  {
    id: 'web-sql-injection',
    title: 'SQL Injection Basics',
    description: 'Learn how SQL injection attacks work and how to prevent them.',
    category: 'web',
    difficulty: 'beginner',
    modules: [
      {
        id: 'sql-injection-intro',
        title: 'Introduction to SQL Injection',
        content: `
# Introduction to SQL Injection

SQL Injection is one of the most common web vulnerabilities. It occurs when user input is incorrectly filtered and directly included in SQL queries.

## What is SQL Injection?

SQL Injection is a code injection technique that exploits vulnerabilities in the database layer of an application. It allows attackers to:

- Access unauthorized data
- Bypass authentication
- Modify database data
- In some cases, execute commands on the operating system

## Basic Example

Consider this vulnerable PHP code:

\`\`\`php
$username = $_POST['username'];
$query = "SELECT * FROM users WHERE username = '$username'";
\`\`\`

If a user enters the username: \`admin' OR '1'='1\`, the resulting query becomes:

\`\`\`sql
SELECT * FROM users WHERE username = 'admin' OR '1'='1'
\`\`\`

Since \`1=1\` is always true, this returns all users in the database, potentially allowing unauthorized access.

In the next section, we'll try some basic SQL injection techniques in a safe environment.
        `,
        language: 'sql',
        codeSnippet: ''
      },
      {
        id: 'sql-injection-login-bypass',
        title: 'Login Bypass with SQL Injection',
        content: `
# Login Bypass with SQL Injection

One common application of SQL injection is bypassing login forms. Let's look at how this works.

## Vulnerable Login Query

Many web applications use code similar to this for authentication:

\`\`\`php
$username = $_POST['username'];
$password = $_POST['password'];

$query = "SELECT * FROM users WHERE username='$username' AND password='$password'";
$result = mysqli_query($connection, $query);

if(mysqli_num_rows($result) > 0) {
    // User authenticated successfully
    // Grant access...
}
\`\`\`

## The Attack

An attacker can bypass this authentication by entering a username like:
\`admin' --\`

This turns the query into:

\`\`\`sql
SELECT * FROM users WHERE username='admin' --' AND password='anything'
\`\`\`

The \`--\` is a SQL comment that makes the database ignore everything after it, effectively removing the password check.

## Your task

In the SQL editor below, write a query that would bypass a login form with the following vulnerable code:

\`\`\`php
$query = "SELECT * FROM users WHERE username='$username' AND password='$password'";
\`\`\`

Your goal is to log in as 'admin' without knowing the password.
        `,
        language: 'sql',
        codeSnippet: "SELECT * FROM users WHERE username='____' AND password='____'",
        solution: "SELECT * FROM users WHERE username='admin' --' AND password='anything'",
        validation: `
function validateCode(code) {
  const lowerCode = code.toLowerCase();
  return (
    lowerCode.includes("admin") && 
    (lowerCode.includes("--") || lowerCode.includes("#") || lowerCode.includes("/*")) &&
    !lowerCode.includes("password")
  );
}
        `
      },
      {
        id: 'sql-injection-prevention',
        title: 'Preventing SQL Injection',
        content: `
# Preventing SQL Injection

Now that you understand how SQL injection works, let's learn how to prevent it.

## Parameterized Queries / Prepared Statements

The most effective way to prevent SQL injection is to use parameterized queries (also known as prepared statements). These separate the SQL code from the data.

### Example in PHP (PDO):

\`\`\`php
// Prepare the statement
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");

// Bind the parameter and execute
$stmt->execute([$username]);
\`\`\`

### Example in JavaScript (Node.js with mysql2):

\`\`\`javascript
const mysql = require('mysql2/promise');

// Later in your code...
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE username = ?', 
  [username]
);
\`\`\`

## Input Validation

While prepared statements are the best defense, you should also validate and sanitize user input:

- Validate data type (is it a number, string, etc.)
- Check length and format
- Filter out special characters when appropriate
- Use whitelisting for expected inputs

## Your task

Convert the following vulnerable JavaScript code to use parameterized queries with the mysql2 package:

\`\`\`javascript
// Vulnerable code
const query = "SELECT * FROM products WHERE category = '" + userInput + "'";
const results = await connection.query(query);
\`\`\`
        `,
        language: 'javascript',
        codeSnippet: `
// Convert this vulnerable code to use parameterized queries
const query = "SELECT * FROM products WHERE category = '" + userInput + "'";
const results = await connection.query(query);
`,
        solution: `
// Secure version using parameterized queries
const [results] = await connection.execute(
  'SELECT * FROM products WHERE category = ?',
  [userInput]
);
`,
        validation: `
function validateCode(code) {
  return (
    code.includes("execute") && 
    code.includes("?") && 
    code.includes("[userInput]") &&
    !code.includes("connection.query")
  );
}
        `
      }
    ]
  },
  {
    id: 'web-xss',
    title: 'Cross-Site Scripting (XSS)',
    description: 'Understand how XSS vulnerabilities work and how to protect your websites.',
    category: 'web',
    difficulty: 'beginner',
    modules: [
      {
        id: 'xss-intro',
        title: 'Introduction to XSS',
        content: `
# Introduction to Cross-Site Scripting (XSS)

Cross-Site Scripting (XSS) is a common web vulnerability that allows attackers to inject client-side scripts into web pages viewed by other users.

## What is XSS?

XSS occurs when an application includes untrusted data in a new web page without proper validation or escaping. This allows attackers to execute scripts in the victim's browser, which can:

- Steal cookies and session tokens
- Redirect users to malicious websites
- Manipulate page content
- Install keyloggers or other malicious code

## Types of XSS

1. **Reflected XSS**: The malicious script comes from the current HTTP request
2. **Stored XSS**: The malicious script is stored on the target server
3. **DOM-based XSS**: The vulnerability exists in client-side code

## Basic Example

Consider a search feature that displays your search term:

\`\`\`html
<p>You searched for: [search term]</p>
\`\`\`

If the site doesn't sanitize input, an attacker could search for:
\`<script>alert('XSS')</script>\`

This would result in:
\`\`\`html
<p>You searched for: <script>alert('XSS')</script></p>
\`\`\`

The browser would then execute the script, displaying an alert box.
        `,
        language: 'html',
        codeSnippet: ''
      },
      {
        id: 'xss-exploitation',
        title: 'Exploiting XSS Vulnerabilities',
        content: `
# Exploiting XSS Vulnerabilities

Now that you understand what XSS is, let's look at how it can be exploited in a vulnerable application.

## Common XSS Vectors

Attackers can inject JavaScript in many ways:

1. **Basic script tags**: \`<script>alert('XSS')</script>\`
2. **Event handlers**: \`<img src="x" onerror="alert('XSS')">\`
3. **JavaScript URLs**: \`<a href="javascript:alert('XSS')">Click me</a>\`
4. **CSS with expressions**: \`<div style="background:url('javascript:alert(1)')">\`

## Bypassing Simple Filters

Many applications try to filter out \`<script>\` tags but miss other vectors:

- Mixed case: \`<ScRiPt>alert('XSS')</ScRiPt>\`
- Encoded characters: \`%3Cscript%3Ealert('XSS')%3C/script%3E\`
- Nested tags: \`<img src="x" <script>alert('XSS')</script>">\`

## Your task

The code below shows a vulnerable comment system. The application filters out \`<script>\` tags but is still vulnerable.

Write an XSS payload that will trigger an alert without using the word "script".
        `,
        language: 'html',
        codeSnippet: `
<!-- This is the vulnerable code that processes comments -->
<div class="comment">
  <!-- Your comment will be inserted here -->
  Thank you for your comment!
</div>

<!-- Your payload should go below -->
<img
`,
        solution: `<img src="x" onerror="alert('XSS')">`,
        validation: `
function validateCode(code) {
  const lowerCode = code.toLowerCase();
  return (
    !lowerCode.includes("<script") && 
    (
      (lowerCode.includes("onerror") || 
       lowerCode.includes("onclick") || 
       lowerCode.includes("onload") || 
       lowerCode.includes("javascript:")) &&
      lowerCode.includes("alert")
    )
  );
}
        `
      },
      {
        id: 'xss-prevention',
        title: 'Preventing XSS Attacks',
        content: `
# Preventing XSS Attacks

Now that you understand how XSS works, let's learn how to defend against it.

## Output Encoding

The primary defense against XSS is properly encoding user-supplied data:

1. **HTML Encoding**: Convert characters like < and > to their HTML entities
2. **JavaScript Encoding**: Escape special characters in JavaScript contexts
3. **URL Encoding**: Encode special characters in URLs
4. **CSS Encoding**: Escape special characters in CSS contexts

## Context-Aware Encoding

Different parts of an HTML document require different encoding:

- HTML body: HTML encoding
- HTML attribute: Attribute encoding
- JavaScript: JavaScript encoding
- URL: URL encoding
- CSS: CSS encoding

## Content Security Policy (CSP)

CSP is an HTTP header that allows you to specify which dynamic resources are allowed to load:

\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com
\`\`\`

## Your task

Fix the vulnerable JavaScript code below to prevent XSS attacks:

\`\`\`javascript
// This function displays a user-provided message
function displayUserMessage(message) {
  // Vulnerable code
  document.getElementById('message').innerHTML = message;
}
\`\`\`
        `,
        language: 'javascript',
        codeSnippet: `
// Fix this vulnerable function to prevent XSS
function displayUserMessage(message) {
  // Vulnerable code
  document.getElementById('message').innerHTML = message;
}
`,
        solution: `
// Fixed function to prevent XSS
function displayUserMessage(message) {
  // Create a text node instead of using innerHTML
  const textNode = document.createTextNode(message);
  document.getElementById('message').textContent = '';
  document.getElementById('message').appendChild(textNode);
}

// Alternative solution
function displayUserMessage(message) {
  document.getElementById('message').textContent = message;
}
`,
        validation: `
function validateCode(code) {
  return (
    (code.includes("textContent") || 
     code.includes("createTextNode")) && 
    !code.includes("innerHTML") &&
    code.includes("message")
  );
}
        `
      }
    ]
  },
  {
    id: 'crypto-basics',
    title: 'Cryptography Fundamentals',
    description: 'Learn the basics of cryptography, including classic ciphers and modern encryption.',
    category: 'crypto',
    difficulty: 'beginner',
    modules: [
      {
        id: 'crypto-caesar',
        title: 'Caesar Cipher',
        content: `
# Caesar Cipher

The Caesar cipher is one of the simplest and oldest encryption techniques. Named after Julius Caesar, it's a type of substitution cipher where each letter in the plaintext is shifted a certain number of places down the alphabet.

## How It Works

1. Choose a shift value (key) between 1 and 25
2. For each letter in your message:
   - Find its position in the alphabet (A=0, B=1, ..., Z=25)
   - Add the shift value to the position
   - If the result is greater than 25, subtract 26
   - Convert the new position back to a letter

## Example

With a shift of 3:
- A → D
- B → E
- C → F
...
- X → A
- Y → B
- Z → C

So "HELLO" becomes "KHOOR"

## Strengths and Weaknesses

**Strengths:**
- Very simple to implement
- Easy to understand

**Weaknesses:**
- Extremely easy to break (only 25 possible keys)
- Vulnerable to frequency analysis
- No protection against known-plaintext attacks

## Your task

Implement a JavaScript function that encrypts a message using the Caesar cipher with a given shift value:
        `,
        language: 'javascript',
        codeSnippet: `
/**
 * Encrypts a message using the Caesar cipher
 * @param {string} message - The plaintext message
 * @param {number} shift - The shift value (1-25)
 * @return {string} The encrypted message
 */
function caesarEncrypt(message, shift) {
  // Your implementation here
}

// Test your function
console.log(caesarEncrypt("HELLO", 3)); // Should output "KHOOR"
`,
        solution: `
/**
 * Encrypts a message using the Caesar cipher
 * @param {string} message - The plaintext message
 * @param {number} shift - The shift value (1-25)
 * @return {string} The encrypted message
 */
function caesarEncrypt(message, shift) {
  // Normalize shift value to be between 0 and 25
  shift = ((shift % 26) + 26) % 26;
  
  let encrypted = "";
  
  // Process each character
  for (let i = 0; i < message.length; i++) {
    let char = message[i];
    
    // Only shift alphabetic characters
    if (char.match(/[a-z]/i)) {
      // Get ASCII code
      const code = message.charCodeAt(i);
      
      // Handle uppercase letters
      if (code >= 65 && code <= 90) {
        char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      // Handle lowercase letters
      else if (code >= 97 && code <= 122) {
        char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
    }
    
    encrypted += char;
  }
  
  return encrypted;
}

// Test your function
console.log(caesarEncrypt("HELLO", 3)); // Should output "KHOOR"
`,
        validation: `
function validateCode(code) {
  // Test if the function correctly encodes "HELLO" with shift 3
  try {
    // Extract the function from the code
    const functionMatch = code.match(/function\\s+caesarEncrypt\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}/);
    if (!functionMatch) return false;
    
    // Create a function from the extracted code
    const caesarEncrypt = new Function(
      'message', 
      'shift', 
      functionMatch[0].replace(/^function\\s+caesarEncrypt\\s*\\([^)]*\\)\\s*\\{/, '').replace(/\\}$/, 'return encrypted;')
    );
    
    // Test the function
    const result = caesarEncrypt("HELLO", 3);
    return result === "KHOOR";
  } catch (e) {
    return false;
  }
}
        `
      },
      {
        id: 'crypto-hash',
        title: 'Cryptographic Hashing',
        content: `
# Cryptographic Hashing

Cryptographic hash functions are mathematical algorithms that map data of any size to a fixed-size output (hash). They are fundamental to modern information security.

## Key Properties of Hash Functions

1. **One-way function**: It should be easy to compute the hash value, but practically impossible to regenerate the original data
2. **Deterministic**: The same input will always produce the same hash value
3. **Avalanche effect**: A small change in the input should produce a completely different hash
4. **Collision resistance**: It should be difficult to find two different inputs that produce the same hash

## Common Hash Functions

- **MD5**: 128-bit output (now considered insecure)
- **SHA-1**: 160-bit output (now considered insecure)
- **SHA-256**: 256-bit output (currently secure)
- **SHA-3**: Latest member of the SHA family, with various output sizes
- **bcrypt**: Specifically designed for password hashing with built-in salt

## Uses in Security

- Password storage (with salting)
- Data integrity verification
- Digital signatures
- Blockchain technology
- Proof of work systems

## Your task

Write a JavaScript function that verifies if a password matches a stored hash. For simplicity, use a basic hash function (SHA-256) available in browsers through the SubtleCrypto API:
        `,
        language: 'javascript',
        codeSnippet: `
/**
 * Converts an ArrayBuffer to a hexadecimal string
 * @param {ArrayBuffer} buffer - The buffer to convert
 * @return {string} The hexadecimal representation
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashes a password using SHA-256
 * @param {string} password - The password to hash
 * @return {Promise<string>} A promise that resolves to the hex hash
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Verifies if a password matches a stored hash
 * @param {string} password - The password to check
 * @param {string} storedHash - The stored hash to compare against
 * @return {Promise<boolean>} A promise that resolves to true if the password matches
 */
async function verifyPassword(password, storedHash) {
  // Your implementation here
}

// Example usage
async function testPasswordVerification() {
  const storedHash = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'; // hash of 'hello'
  console.log(await verifyPassword('hello', storedHash)); // Should output true
  console.log(await verifyPassword('wrong', storedHash)); // Should output false
}

testPasswordVerification();
`,
        solution: `
/**
 * Converts an ArrayBuffer to a hexadecimal string
 * @param {ArrayBuffer} buffer - The buffer to convert
 * @return {string} The hexadecimal representation
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashes a password using SHA-256
 * @param {string} password - The password to hash
 * @return {Promise<string>} A promise that resolves to the hex hash
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Verifies if a password matches a stored hash
 * @param {string} password - The password to check
 * @param {string} storedHash - The stored hash to compare against
 * @return {Promise<boolean>} A promise that resolves to true if the password matches
 */
async function verifyPassword(password, storedHash) {
  // Hash the input password
  const hashedPassword = await hashPassword(password);
  
  // Compare the hashed password with the stored hash
  return hashedPassword === storedHash;
}

// Example usage
async function testPasswordVerification() {
  const storedHash = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'; // hash of 'hello'
  console.log(await verifyPassword('hello', storedHash)); // Should output true
  console.log(await verifyPassword('wrong', storedHash)); // Should output false
}

testPasswordVerification();
`,
        validation: `
function validateCode(code) {
  return (
    code.includes("hashPassword") && 
    code.includes("===") && 
    code.includes("return") &&
    code.includes("await")
  );
}
        `
      }
    ]
  }
];

// Function to get a course by ID
export const getCourse = (id: string): Course | undefined => {
  return courses.find(course => course.id === id);
};

// Function to get all courses
export const getCourses = (): Course[] => {
  return courses;
};

// Function to get a specific module from a course
export const getCourseModule = (courseId: string, moduleId: string) => {
  const course = getCourse(courseId);
  if (!course) return undefined;
  
  return course.modules.find(module => module.id === moduleId);
};