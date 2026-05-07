<template>
  <div class="code-card">
    <div class="code-titlebar">
      <div class="dot dot-r"></div>
      <div class="dot dot-y"></div>
      <div class="dot dot-g"></div>
    </div>
    <div class="code-body">
      <span class="kw">function</span> <span class="fn">authenticateUser</span>(credentials) {<br/>
      &nbsp;&nbsp;<span class="kw">try</span> {<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">const</span> token = <span class="kw">await</span> authService.<span class="fn">login</span>({<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;email: credentials.<span class="str">email</span>,<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;password: credentials.<span class="str">password</span><br/>
      &nbsp;&nbsp;&nbsp;&nbsp;});<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">return</span> { success: <span class="kw">true</span>, token };<br/>
      &nbsp;&nbsp;} <span class="kw">catch</span> (err) {<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;<span class="cm">// handle error</span><br/>
      &nbsp;&nbsp;}<br/>
      }
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.code-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 88%;
  background: black;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,.28);
  animation: floatA 6s ease-in-out infinite;
}

@keyframes floatA {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

.code-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(255,255,255,.05);
}

.dot { width: 11px; height: 11px; border-radius: 50%; }
.dot-r { background: #ff5f57; }
.dot-y { background: #febc2e; }
.dot-g { background: #28c840; }

.code-body {
  padding: 14px 18px;
  font-family: 'JetBrains Mono', monospace;
  font-size: .72rem;
  line-height: 1.7;
  color: #cdd6f4;
}

.kw  { color: #cba6f7; }
.fn  { color: #89dceb; }
.str { color: #a6e3a1; }
.cm  { color: #585b70; }
</style>
