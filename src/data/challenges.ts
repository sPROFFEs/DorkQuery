import { Challenge } from '../types';

export const challenges: Challenge[] = [
  {
    id: 'web-basic-inspection',
    title: 'Hidden in Plain Sight',
    description: 'Someone hid a secret message in this webpage. Can you find it?',
    difficulty: 'beginner',
    category: 'web',
    points: 100,
    hints: [
      'Have you tried inspecting the page?',
      'Check the HTML comments.'
    ],
    flag: 'FLAG{inspect_element_ftw}',
    content: `
<div class="challenge-content">
  <p>Welcome to your first challenge! This webpage contains a hidden message.</p>
  <p>Your mission is to find the secret flag.</p>
  
  <div class="instructions">
    <h3>Instructions:</h3>
    <ol>
      <li>Use your browser's developer tools to inspect this page</li>
      <li>Look for anything unusual or hidden</li>
      <li>Submit the flag when you find it</li>
    </ol>
  </div>
  
  <!-- FLAG{inspect_element_ftw} -->
  
  <div class="tips">
    <p>Tip: In most browsers, you can right-click and select "Inspect" or press F12.</p>
  </div>
</div>
    `
  },
  {
    id: 'crypto-caesar',
    title: 'Caesar\'s Secret',
    description: 'Julius Caesar used a simple cipher to protect his messages. Can you decrypt this one?',
    difficulty: 'beginner',
    category: 'crypto',
    points: 150,
    hints: [
      'This is a substitution cipher where each letter is shifted by a fixed number.',
      'Try shifting each letter by 13 positions in the alphabet.'
    ],
    flag: 'FLAG{et_tu_brute}',
    content: `
<div class="challenge-content">
  <p>You've intercepted a message that was encrypted using Caesar's cipher:</p>
  
  <div class="terminal">
    <pre>SYNT{rg_gh_oehgr}</pre>
  </div>
  
  <div class="instructions">
    <h3>Instructions:</h3>
    <ol>
      <li>Research how Caesar cipher works</li>
      <li>Determine the shift used in this message</li>
      <li>Decrypt the message to find the flag</li>
    </ol>
  </div>
  
  <div class="tips">
    <p>Tip: In a Caesar cipher, each letter is shifted a certain number of places down the alphabet.</p>
  </div>
</div>
    `
  },
  {
    id: 'web-cookie-monster',
    title: 'Cookie Monster',
    description: 'There\'s a secret admin cookie on this site. Can you find and use it?',
    difficulty: 'beginner',
    category: 'web',
    points: 200,
    hints: [
      'Check the browser cookies for this page.',
      'You need to modify a cookie value.'
    ],
    flag: 'FLAG{cookies_are_delicious}',
    content: `
<div class="challenge-content">
  <p>Welcome to the Cookie Monster challenge!</p>
  
  <div class="instructions">
    <h3>Instructions:</h3>
    <ol>
      <li>This page sets a browser cookie when it loads</li>
      <li>Find the cookie and examine its value</li>
      <li>Modify the cookie to gain admin access</li>
      <li>The flag will appear once you're logged in as admin</li>
    </ol>
  </div>
  
  <div id="cookie-result">
    <p>Current status: <span id="status">user</span></p>
  </div>
  
  <div class="tips">
    <p>Tip: You can view and edit cookies in your browser's developer tools.</p>
  </div>
  
  <script>
    // Set a user cookie when the page loads
    document.cookie = "role=user; path=/";
    
    // Function to check the cookie
    function checkAdminStatus() {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'role' && value === 'admin') {
          document.getElementById('status').textContent = 'admin';
          document.getElementById('cookie-result').innerHTML += '<div class="success-message">Congratulations! FLAG{cookies_are_delicious}</div>';
          return;
        }
      }
      setTimeout(checkAdminStatus, 1000); // Check again in 1 second
    }
    
    // Start checking
    checkAdminStatus();
  </script>
</div>
    `
  },
  {
    id: 'forensics-metadata',
    title: 'Hidden Metadata',
    description: 'There\'s a secret hidden in the metadata of this image. Can you extract it?',
    difficulty: 'intermediate',
    category: 'forensics',
    points: 250,
    hints: [
      'Images often contain metadata like EXIF data.',
      'Try using an online EXIF viewer tool.'
    ],
    flag: 'FLAG{metadata_never_lies}',
    content: `
<div class="challenge-content">
  <p>Digital files often contain hidden metadata that isn't visible to the naked eye.</p>
  
  <div class="image-container">
    <img src="https://images.pexels.com/photos/270373/pexels-photo-270373.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Image with hidden metadata" class="challenge-image" />
  </div>
  
  <div class="instructions">
    <h3>Instructions:</h3>
    <ol>
      <li>Download the image above</li>
      <li>Use an EXIF data viewer tool to examine its metadata</li>
      <li>Find the hidden flag in the metadata</li>
    </ol>
  </div>
  
  <div class="note">
    <p><strong>Note:</strong> For this demo challenge, the flag is: FLAG{metadata_never_lies}</p>
    <p>In a real CTF, you would actually need to download the image and extract the metadata.</p>
  </div>
</div>
    `
  },
  {
    id: 'web-xss-basics',
    title: 'XSS 101',
    description: 'This webpage is vulnerable to Cross-Site Scripting (XSS). Can you execute JavaScript to find the flag?',
    difficulty: 'intermediate',
    category: 'web',
    points: 300,
    hints: [
      'The comment form doesn\'t sanitize user input.',
      'Try injecting some JavaScript code in the comment field.'
    ],
    flag: 'FLAG{xss_alert_success}',
    content: `
<div class="challenge-content">
  <p>This website has a comments section that doesn't properly sanitize user input.</p>
  
  <div class="comment-section">
    <h3>Comments</h3>
    <div id="comments-list">
      <div class="comment">
        <strong>Admin:</strong> Welcome to our site! Leave a comment below.
      </div>
    </div>
    
    <div class="comment-form">
      <h4>Add a comment:</h4>
      <input type="text" id="comment-author" placeholder="Your name" value="Guest" />
      <textarea id="comment-text" placeholder="Your comment"></textarea>
      <button id="submit-comment">Post Comment</button>
    </div>
  </div>
  
  <div class="instructions">
    <h3>Instructions:</h3>
    <ol>
      <li>The comment system is vulnerable to XSS</li>
      <li>Find a way to execute JavaScript in the browser</li>
      <li>If you successfully trigger an alert, the flag will appear</li>
    </ol>
  </div>
  
  <script>
    // Function to add a comment (vulnerable to XSS)
    document.getElementById('submit-comment').addEventListener('click', function() {
      const author = document.getElementById('comment-author').value || 'Anonymous';
      const text = document.getElementById('comment-text').value;
      
      if (text) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = '<strong>' + author + ':</strong> ' + text;
        
        document.getElementById('comments-list').appendChild(commentDiv);
        document.getElementById('comment-text').value = '';
        
        // Check if an alert was triggered
        if (text.includes('alert(') && text.includes(')')) {
          setTimeout(function() {
            const flagDiv = document.createElement('div');
            flagDiv.className = 'success-message';
            flagDiv.textContent = 'Congratulations! You found the flag: FLAG{xss_alert_success}';
            document.querySelector('.challenge-content').appendChild(flagDiv);
          }, 500);
        }
      }
    });
  </script>
</div>
    `
  },
  {
    id: 'reverse-js-obfuscation',
    title: 'Obfuscated JavaScript',
    description: 'This webpage contains obfuscated JavaScript code. Can you reverse engineer it to find the flag?',
    difficulty: 'advanced',
    category: 'reverse',
    points: 400,
    hints: [
      'Try to de-obfuscate the JavaScript code.',
      'Look for patterns in the obfuscated code that might reveal the flag.'
    ],
    flag: 'FLAG{javascript_deobfuscated}',
    content: `
<div class="challenge-content">
  <p>Reverse engineers often need to understand obfuscated code. This page contains obfuscated JavaScript that hides a flag.</p>
  
  <div class="code-section">
    <h3>Obfuscated JavaScript:</h3>
    <pre class="code-display">
var _0x2c8c=['\\x76\\x61\\x6C\\x75\\x65','\\x66\\x6C\\x61\\x67\\x2D\\x69\\x6E\\x70\\x75\\x74','\\x67\\x65\\x74\\x45\\x6C\\x65\\x6D\\x65\\x6E\\x74\\x42\\x79\\x49\\x64','\\x46\\x4C\\x41\\x47\\x7B\\x6A\\x61\\x76\\x61\\x73\\x63\\x72\\x69\\x70\\x74\\x5F\\x64\\x65\\x6F\\x62\\x66\\x75\\x73\\x63\\x61\\x74\\x65\\x64\\x7D','\\x63\\x68\\x65\\x63\\x6B\\x46\\x6C\\x61\\x67','\\x6F\\x6E\\x63\\x6C\\x69\\x63\\x6B','\\x63\\x68\\x65\\x63\\x6B\\x2D\\x62\\x74\\x6E','\\x69\\x6E\\x6E\\x65\\x72\\x48\\x54\\x4D\\x4C','\\x72\\x65\\x73\\x75\\x6C\\x74','\\x43\\x6F\\x72\\x72\\x65\\x63\\x74\\x21\\x20\\x59\\x6F\\x75\\x20\\x66\\x6F\\x75\\x6E\\x64\\x20\\x74\\x68\\x65\\x20\\x66\\x6C\\x61\\x67\\x2E','\\x57\\x72\\x6F\\x6E\\x67\\x20\\x66\\x6C\\x61\\x67\\x2E\\x20\\x54\\x72\\x79\\x20\\x61\\x67\\x61\\x69\\x6E\\x2E'];(function(_0x5b1ec3,_0x2c8ce4){var _0x39a849=function(_0x54fd99){while(--_0x54fd99){_0x5b1ec3['push'](_0x5b1ec3['shift']());}};_0x39a849(++_0x2c8ce4);}(_0x2c8c,0x107));var _0x39a8=function(_0x5b1ec3,_0x2c8ce4){_0x5b1ec3=_0x5b1ec3-0x0;var _0x39a849=_0x2c8c[_0x5b1ec3];return _0x39a849;};function checkFlag(){var _0xd5e28=document[_0x39a8('0x0')](_0x39a8('0x1'))[_0x39a8('0x2')];var _0x15f88b=_0x39a8('0x3');if(_0xd5e28===_0x15f88b){document[_0x39a8('0x0')](_0x39a8('0x4'))[_0x39a8('0x5')]=_0x39a8('0x6');}else{document[_0x39a8('0x0')](_0x39a8('0x4'))[_0x39a8('0x5')]=_0x39a8('0x7');}}document[_0x39a8('0x0')](_0x39a8('0x8'))[_0x39a8('0x9')]=checkFlag;
    </pre>
  </div>
  
  <div class="flag-section">
    <h3>Enter the flag:</h3>
    <input type="text" id="flag-input" class="flag-input" placeholder="FLAG{...}" />
    <button id="check-btn" class="btn btn-primary">Check Flag</button>
    <div id="result" class="result-message"></div>
  </div>
  
  <div class="instructions">
    <h3>Instructions:</h3>
    <ol>
      <li>Analyze the obfuscated JavaScript code</li>
      <li>Try to understand what it does and find the hidden flag</li>
      <li>Enter the flag in the input field above</li>
    </ol>
  </div>
  
  <div class="tips">
    <p>Tip: Online JavaScript de-obfuscation tools can help you analyze the code.</p>
  </div>
</div>
    `
  }
];

// Function to get a challenge by ID
export const getChallenge = (id: string): Challenge | undefined => {
  return challenges.find(challenge => challenge.id === id);
};

// Function to get all challenges
export const getChallenges = (): Challenge[] => {
  return challenges;
};