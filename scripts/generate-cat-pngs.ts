import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const catsSvg = [
  // 1. Gray Red Heart-Eyes Tabby
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(244,63,94,0.25))">
      <!-- White Sticker Die-cut Contour -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#94a3b8" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Main Body -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#94a3b8" stroke="#334155" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#fda4af"/>
      <polygon points="360,145 322,205 357,205" fill="#fda4af"/>

      <!-- Tabby Forehead Stripes -->
      <path d="M256 195 L256 230 M230 205 L235 235 M282 205 L277 235" stroke="#475569" stroke-width="10" stroke-linecap="round"/>

      <!-- White Belly Patch -->
      <ellipse cx="256" cy="385" rx="80" ry="55" fill="#f8fafc"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#f8fafc" stroke="#334155" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#f8fafc" stroke="#334155" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="175" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="337" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.6"/>

      <!-- Heart Eyes (Red Heart) -->
      <path d="M205 250 C185 225 155 245 175 275 L205 305 L235 275 C255 245 225 225 205 250 Z" fill="#e11d48" stroke="#9f1239" stroke-width="4"/>
      <path d="M307 250 C287 225 257 245 277 275 L307 305 L337 275 C357 245 327 225 307 250 Z" fill="#e11d48" stroke="#9f1239" stroke-width="4"/>
      <circle cx="195" cy="255" r="5" fill="#ffffff"/>
      <circle cx="297" cy="255" r="5" fill="#ffffff"/>

      <!-- Nose and Cute Mouth -->
      <polygon points="256,290 250,282 262,282" fill="#f43f5e"/>
      <path d="M244 294 C248 304 256 304 256 294 C256 304 264 304 268 294" fill="none" stroke="#1e293b" stroke-width="8" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 295 L165 300 M120 315 L165 312 M387 295 L347 300 M392 315 L347 312" stroke="#334155" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 2. Ivory White Brown Mask Siamese
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(168,85,247,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail (Dark brown) -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#582f1b" stroke="#2c1810" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (Cream / Ivory) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#fef9ee" stroke="#2c1810" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Brown Ears -->
      <polygon points="147,133 195,210 148,210" fill="#582f1b"/>
      <polygon points="365,133 317,210 364,210" fill="#582f1b"/>

      <!-- Siamese Mask -->
      <ellipse cx="256" cy="285" rx="88" ry="68" fill="#6d3b24"/>

      <!-- Paws (Dark Brown) -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#582f1b" stroke="#2c1810" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#582f1b" stroke="#2c1810" stroke-width="8"/>

      <!-- Sparkling Eyes with Stars -->
      <circle cx="205" cy="275" r="28" fill="#1e1b4b"/>
      <circle cx="307" cy="275" r="28" fill="#1e1b4b"/>
      <circle cx="198" cy="268" r="10" fill="#38bdf8"/>
      <circle cx="300" cy="268" r="10" fill="#38bdf8"/>
      <!-- Star glints -->
      <path d="M205 260 L208 275 L223 275 L211 283 L215 298 L205 288 L195 298 L199 283 L187 275 L202 275 Z" fill="#ffffff"/>
      <path d="M307 260 L310 275 L325 275 L313 283 L317 298 L307 288 L297 298 L301 283 L289 275 L304 275 Z" fill="#ffffff"/>

      <!-- Cheeks -->
      <ellipse cx="160" cy="308" rx="16" ry="10" fill="#f472b6" opacity="0.7"/>
      <ellipse cx="352" cy="308" rx="16" ry="10" fill="#f472b6" opacity="0.7"/>

      <!-- Nose and Mouth -->
      <polygon points="256,298 250,290 262,290" fill="#f43f5e"/>
      <path d="M244 304 C248 314 256 314 256 304 C256 314 264 314 268 304" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 305 L165 308 M120 325 L165 320 M387 305 L347 308 M392 325 L347 320" stroke="#fef9ee" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 3. Slate Black Teary Puppy-Eyes Kitten
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(100,116,139,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#334155" stroke="#0f172a" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#334155" stroke="#0f172a" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#f43f5e" opacity="0.8"/>
      <polygon points="360,145 322,205 357,205" fill="#f43f5e" opacity="0.8"/>

      <!-- Droopy sad eyebrows -->
      <path d="M175 220 C190 215 215 225 225 235" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M337 220 C322 215 297 225 287 235" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" fill="none"/>

      <!-- Giant Puppy Eyes with Water Highlights -->
      <circle cx="205" cy="275" r="32" fill="#020617"/>
      <circle cx="307" cy="275" r="32" fill="#020617"/>
      <!-- Big Glistening Bubbles -->
      <circle cx="195" cy="265" r="14" fill="#ffffff"/>
      <circle cx="297" cy="265" r="14" fill="#ffffff"/>
      <circle cx="218" cy="288" r="8" fill="#38bdf8"/>
      <circle cx="320" cy="288" r="8" fill="#38bdf8"/>
      <circle cx="225" cy="275" r="4" fill="#ffffff"/>
      <circle cx="327" cy="275" r="4" fill="#ffffff"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#475569" stroke="#0f172a" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#475569" stroke="#0f172a" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="155" cy="315" rx="18" ry="12" fill="#f43f5e" opacity="0.4"/>
      <ellipse cx="357" cy="315" rx="18" ry="12" fill="#f43f5e" opacity="0.4"/>

      <!-- Quivering Cute Mouth -->
      <polygon points="256,295 250,287 262,287" fill="#fda4af"/>
      <path d="M242 305 C248 312 256 312 256 305 C256 312 264 312 270 305" fill="none" stroke="#f1f5f9" stroke-width="6" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 305 L165 308 M120 325 L165 320 M387 305 L347 308 M392 325 L347 320" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 4. Ginger Orange Striped Smiling Cat
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(249,115,22,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail (Waving high to the left) -->
      <path d="M150 380 C80 380 65 280 105 250 C115 240 130 250 125 270 C100 290 110 350 160 350 Z" fill="#f97316" stroke="#7c2d12" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (Ginger Orange) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#f97316" stroke="#7c2d12" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#fed7aa"/>
      <polygon points="360,145 322,205 357,205" fill="#fed7aa"/>

      <!-- Tiger Stripes -->
      <path d="M256 195 L256 230 M225 205 L230 235 M287 205 L282 235" stroke="#c2410c" stroke-width="10" stroke-linecap="round"/>
      <path d="M135 270 L160 275 M130 290 L165 292 M377 270 L352 275 M382 290 L347 292" stroke="#c2410c" stroke-width="10" stroke-linecap="round"/>

      <!-- Cream Chest / Belly -->
      <ellipse cx="256" cy="385" rx="75" ry="50" fill="#fff7ed"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#fff7ed" stroke="#7c2d12" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#fff7ed" stroke="#7c2d12" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="170" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="342" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.6"/>

      <!-- Big Happy Eyes -->
      <circle cx="205" cy="265" r="26" fill="#1e1b4b"/>
      <circle cx="307" cy="265" r="26" fill="#1e1b4b"/>
      <circle cx="196" cy="256" r="10" fill="#ffffff"/>
      <circle cx="298" cy="256" r="10" fill="#ffffff"/>
      <circle cx="215" cy="275" r="5" fill="#ffffff"/>
      <circle cx="317" cy="275" r="5" fill="#ffffff"/>

      <!-- Nose and Big Sunny Smile (:3) -->
      <polygon points="256,285 250,277 262,277" fill="#e11d48"/>
      <path d="M238 288 C244 304 256 304 256 290 C256 304 268 304 274 288" fill="none" stroke="#7c2d12" stroke-width="8" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 295 L165 300 M120 315 L165 312 M387 295 L347 300 M392 315 L347 312" stroke="#7c2d12" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 5. Midnight Black Big Round Eyes Kitten (O_O)
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(14,165,233,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#0f172a" stroke="#020617" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (Midnight Black) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#0f172a" stroke="#020617" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#f43f5e" opacity="0.9"/>
      <polygon points="360,145 322,205 357,205" fill="#f43f5e" opacity="0.9"/>

      <!-- Giant Cartoon O_O Eyes -->
      <circle cx="205" cy="270" r="38" fill="#ffffff"/>
      <circle cx="307" cy="270" r="38" fill="#ffffff"/>
      <circle cx="205" cy="270" r="24" fill="#020617"/>
      <circle cx="307" cy="270" r="24" fill="#020617"/>
      <!-- Glints -->
      <circle cx="196" cy="260" r="10" fill="#ffffff"/>
      <circle cx="298" cy="260" r="10" fill="#ffffff"/>
      <circle cx="214" cy="278" r="5" fill="#38bdf8"/>
      <circle cx="316" cy="278" r="5" fill="#38bdf8"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#1e293b" stroke="#020617" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#1e293b" stroke="#020617" stroke-width="8"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="145" cy="315" rx="16" ry="10" fill="#fb7185" opacity="0.8"/>
      <ellipse cx="367" cy="315" rx="16" ry="10" fill="#fb7185" opacity="0.8"/>

      <!-- Nose and Mouth -->
      <polygon points="256,295 250,287 262,287" fill="#fda4af"/>
      <path d="M244 302 C248 312 256 312 256 302 C256 312 264 312 268 302" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>

      <!-- White Whiskers -->
      <path d="M115 305 L155 308 M110 325 L155 320 M397 305 L357 308 M402 325 L357 320" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 6. White Orange-Patched Squinting Joyful Cat (^-^) - Matches User Image 2!
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(236,72,153,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail (Orange patch tail) -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#f97316" stroke="#2c1810" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (Pure White) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#ffffff" stroke="#2c1810" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Left Ear White, Right Ear Orange + Head Patch -->
      <path d="M145 130 L195 210 L256 160 C230 150 180 130 145 130 Z" fill="#f97316"/>
      <polygon points="152,145 190,205 155,205" fill="#fdba74"/>
      <polygon points="360,145 322,205 357,205" fill="#fbcfe8"/>

      <!-- Paws (Orange) -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#fdba74" stroke="#2c1810" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#fdba74" stroke="#2c1810" stroke-width="8"/>

      <!-- Cheeks (Warm Pink) -->
      <ellipse cx="160" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.7"/>
      <ellipse cx="352" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.7"/>

      <!-- Joyful Squinted Eyes (^-^) with Eyelashes -->
      <path d="M175 265 Q205 235 235 265 M168 258 L160 252 M174 250 L168 242" stroke="#2c1810" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M277 265 Q307 235 337 265 M344 258 L352 252 M338 250 L344 242" stroke="#2c1810" stroke-width="10" stroke-linecap="round" fill="none"/>

      <!-- Nose and Mouth (:3) -->
      <polygon points="256,285 250,277 262,277" fill="#f43f5e"/>
      <path d="M238 288 C244 304 256 304 256 290 C256 304 268 304 274 288" fill="none" stroke="#2c1810" stroke-width="8" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M115 295 L155 300 M110 315 L155 312 M397 295 L357 300 M402 315 L357 312" stroke="#2c1810" stroke-width="8" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 7. Silver Striped White-Bib Tabby
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(16,185,129,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#cbd5e1" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (Silver Slate) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#e2e8f0" stroke="#334155" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#fda4af"/>
      <polygon points="360,145 322,205 357,205" fill="#fda4af"/>

      <!-- Stripes -->
      <path d="M256 190 L256 220 M225 200 L230 225 M287 200 L282 225" stroke="#64748b" stroke-width="9" stroke-linecap="round"/>
      <path d="M135 265 L160 270 M130 285 L165 287 M377 265 L352 270 M382 285 L347 287" stroke="#64748b" stroke-width="9" stroke-linecap="round"/>

      <!-- White Bib Chest -->
      <path d="M210 320 C210 320 256 360 256 420 C256 360 302 320 302 320 Z" fill="#ffffff"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#334155" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#334155" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="170" cy="305" rx="20" ry="12" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="342" cy="305" rx="20" ry="12" fill="#fb7185" opacity="0.6"/>

      <!-- Gentle Cute Eyes -->
      <circle cx="205" cy="265" r="24" fill="#0f172a"/>
      <circle cx="307" cy="265" r="24" fill="#0f172a"/>
      <circle cx="198" cy="258" r="9" fill="#ffffff"/>
      <circle cx="300" cy="258" r="9" fill="#ffffff"/>

      <!-- Nose and Sweet Smile -->
      <polygon points="256,285 250,277 262,277" fill="#f43f5e"/>
      <path d="M244 290 C248 300 256 300 256 290 C256 300 264 300 268 290" fill="none" stroke="#334155" stroke-width="7" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 295 L165 300 M120 315 L165 312 M387 295 L347 300 M392 315 L347 312" stroke="#334155" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 8. White Two-Tone Ears Spotted Calico
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(132,204,22,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail (Spotted tail) -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#78350f" stroke="#1c1917" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (White) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#ffffff" stroke="#1c1917" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Left Ear Brown, Right Ear Black -->
      <polygon points="147,133 195,210 148,210" fill="#92400e"/>
      <polygon points="365,133 317,210 364,210" fill="#1c1917"/>

      <!-- Body Spots -->
      <circle cx="160" cy="360" r="22" fill="#92400e"/>
      <circle cx="340" cy="380" r="18" fill="#1c1917"/>
      <circle cx="355" cy="340" r="14" fill="#92400e"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#1c1917" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#1c1917" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="170" cy="305" rx="20" ry="12" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="342" cy="305" rx="20" ry="12" fill="#fb7185" opacity="0.6"/>

      <!-- Playful Eyes -->
      <circle cx="205" cy="265" r="25" fill="#1c1917"/>
      <circle cx="307" cy="265" r="25" fill="#1c1917"/>
      <circle cx="197" cy="257" r="9" fill="#ffffff"/>
      <circle cx="299" cy="257" r="9" fill="#ffffff"/>

      <!-- Nose and Smile -->
      <polygon points="256,285 250,277 262,277" fill="#f43f5e"/>
      <path d="M238 288 C244 304 256 304 256 290 C256 304 268 304 274 288" fill="none" stroke="#1c1917" stroke-width="8" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 295 L165 300 M120 315 L165 312 M387 295 L347 300 M392 315 L347 312" stroke="#1c1917" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 9. White Brown-Spotted Sparkling Star Eyes Cat - Matches User Image 1!
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(217,119,6,0.25))">
      <!-- Sticker Cutout Contour (Die Cut Sticker) -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail (Curved upwards) -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#b45309" stroke="#451a03" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Main Body (White) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#ffffff" stroke="#451a03" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Head Brown Patches -->
      <path d="M145 130 L195 210 L256 160 C230 145 180 130 145 130 Z" fill="#b45309"/>
      <path d="M367 130 L317 210 L256 160 C282 145 332 130 367 130 Z" fill="#b45309"/>

      <!-- Torso Brown Spots (Matching user image 1!) -->
      <ellipse cx="256" cy="380" rx="35" ry="24" fill="#b45309"/>
      <circle cx="160" cy="385" r="22" fill="#b45309"/>
      <circle cx="355" cy="360" r="32" fill="#b45309"/>
      <circle cx="340" cy="270" r="24" fill="#b45309"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#451a03" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#451a03" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="165" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="347" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.6"/>

      <!-- Big Glistening Star Eyes -->
      <circle cx="205" cy="265" r="30" fill="#0f172a"/>
      <circle cx="307" cy="265" r="30" fill="#0f172a"/>
      <circle cx="195" cy="255" r="12" fill="#ffffff"/>
      <circle cx="297" cy="255" r="12" fill="#ffffff"/>
      <circle cx="218" cy="278" r="6" fill="#ffffff"/>
      <circle cx="320" cy="278" r="6" fill="#ffffff"/>

      <!-- Cute :3 Mouth -->
      <path d="M238 288 C244 304 256 304 256 290 C256 304 268 304 274 288" fill="none" stroke="#451a03" stroke-width="8" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 295 L165 300 M120 315 L165 312 M387 295 L347 300 M392 315 L347 312" stroke="#451a03" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 10. Light Gray Fierce Brows Determined Kitty (\ /)
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(99,102,241,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (Light Slate Gray) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#fda4af"/>
      <polygon points="360,145 322,205 357,205" fill="#fda4af"/>

      <!-- Fierce Slanted Brows (\ /) -->
      <path d="M175 220 L235 245" stroke="#1e293b" stroke-width="12" stroke-linecap="round"/>
      <path d="M337 220 L277 245" stroke="#1e293b" stroke-width="12" stroke-linecap="round"/>

      <!-- Focused Sharp Eyes -->
      <circle cx="205" cy="270" r="26" fill="#1e293b"/>
      <circle cx="307" cy="270" r="26" fill="#1e293b"/>
      <circle cx="198" cy="265" r="9" fill="#ffffff"/>
      <circle cx="300" cy="265" r="9" fill="#ffffff"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#f8fafc" stroke="#1e293b" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#f8fafc" stroke="#1e293b" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="165" cy="315" rx="18" ry="12" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="347" cy="315" rx="18" ry="12" fill="#fb7185" opacity="0.6"/>

      <!-- Determined Straight Mouth -->
      <polygon points="256,290 250,282 262,282" fill="#f43f5e"/>
      <path d="M242 298 L270 298" stroke="#1e293b" stroke-width="8" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 295 L165 300 M120 315 L165 312 M387 295 L347 300 M392 315 L347 312" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 11. Chocolate Brown Round Rosy Cheeks Cat
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(244,63,94,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#854d0e" stroke="#422006" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Fluffy Cheek Body (Chocolate) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 415 230 400 270 C425 290 415 350 390 400 C365 445 147 445 122 400 C97 350 87 290 112 270 C97 230 117 175 145 130 Z" fill="#854d0e" stroke="#422006" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#fbcfe8"/>
      <polygon points="360,145 322,205 357,205" fill="#fbcfe8"/>

      <!-- Giant Bright Pink Rosy Cheeks -->
      <circle cx="160" cy="305" r="32" fill="#f43f5e" opacity="0.7"/>
      <circle cx="352" cy="305" r="32" fill="#f43f5e" opacity="0.7"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#fef08a" stroke="#422006" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#fef08a" stroke="#422006" stroke-width="8"/>

      <!-- Sweet Eyes -->
      <circle cx="205" cy="265" r="26" fill="#1c1917"/>
      <circle cx="307" cy="265" r="26" fill="#1c1917"/>
      <circle cx="197" cy="257" r="10" fill="#ffffff"/>
      <circle cx="299" cy="257" r="10" fill="#ffffff"/>

      <!-- Nose and Mouth -->
      <polygon points="256,285 250,277 262,277" fill="#f43f5e"/>
      <path d="M242 292 C248 304 256 304 256 292 C256 304 264 304 270 292" fill="none" stroke="#fef9c3" stroke-width="8" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M115 295 L145 300 M110 315 L145 312 M397 295 L367 300 M402 315 L367 312" stroke="#fef9c3" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 12. White Left-Ear Orange Patch Winking Cat
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(234,88,12,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#ea580c" stroke="#1c1917" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (White) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#ffffff" stroke="#1c1917" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Left Ear Orange Patch -->
      <path d="M145 130 L195 210 L240 170 C210 150 170 130 145 130 Z" fill="#ea580c"/>
      <polygon points="152,145 190,205 155,205" fill="#fdba74"/>
      <polygon points="360,145 322,205 357,205" fill="#fda4af"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#1c1917" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#1c1917" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="170" cy="305" rx="20" ry="12" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="342" cy="305" rx="20" ry="12" fill="#fb7185" opacity="0.6"/>

      <!-- Playful Winking Eyes (^.<) -->
      <path d="M180 268 Q205 240 230 268" stroke="#1c1917" stroke-width="10" stroke-linecap="round" fill="none"/>
      <circle cx="307" cy="265" r="26" fill="#1c1917"/>
      <circle cx="299" cy="257" r="10" fill="#ffffff"/>
      <circle cx="317" cy="275" r="5" fill="#ffffff"/>

      <!-- Cute Smile -->
      <polygon points="256,285 250,277 262,277" fill="#f43f5e"/>
      <path d="M238 288 C244 304 256 304 256 290 C256 304 268 304 274 288" fill="none" stroke="#1c1917" stroke-width="8" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 295 L165 300 M120 315 L165 312 M387 295 L347 300 M392 315 L347 312" stroke="#1c1917" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 13. Dark Gray Side-Eye Smirking Kitty (¬_¬)
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(5,150,105,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#475569" stroke="#0f172a" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (Dark Slate) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#475569" stroke="#0f172a" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#fda4af"/>
      <polygon points="360,145 322,205 357,205" fill="#fda4af"/>

      <!-- Side-Eye Eyeballs (Looking Left ¬_¬) -->
      <ellipse cx="205" cy="265" rx="30" ry="24" fill="#ffffff"/>
      <ellipse cx="307" cy="265" rx="30" ry="24" fill="#ffffff"/>
      <circle cx="190" cy="265" r="16" fill="#0f172a"/>
      <circle cx="292" cy="265" r="16" fill="#0f172a"/>
      <circle cx="185" cy="260" r="6" fill="#ffffff"/>
      <circle cx="287" cy="260" r="6" fill="#ffffff"/>

      <!-- Eyelids (Half-closed) -->
      <path d="M175 250 C185 242 225 242 235 250" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
      <path d="M277 250 C287 242 327 242 337 250" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#64748b" stroke="#0f172a" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#64748b" stroke="#0f172a" stroke-width="8"/>

      <!-- Smug Smirk -->
      <polygon points="256,285 250,277 262,277" fill="#f43f5e"/>
      <path d="M245 292 C255 294 265 304 275 292" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 295 L165 300 M120 315 L165 312 M387 295 L347 300 M392 315 L347 312" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 14. Orange Tabby Chubby Belly Squinting Cat (-_-)
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(245,158,11,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C420 160 425 240 420 270 C435 320 425 410 395 440 C350 470 162 470 117 440 C87 410 77 320 92 270 C87 240 92 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M375 390 C445 390 460 290 420 260 C410 250 395 260 400 280 C425 300 415 360 365 360 Z" fill="#f59e0b" stroke="#78350f" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Chubby Belly Body (Extra Wide) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C405 175 410 250 405 280 C420 330 410 410 380 435 C345 460 167 460 132 435 C102 410 92 330 107 280 C102 250 107 175 145 130 Z" fill="#f59e0b" stroke="#78350f" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#fde68a"/>
      <polygon points="360,145 322,205 357,205" fill="#fde68a"/>

      <!-- Tiger Stripes -->
      <path d="M256 195 L256 225 M225 205 L230 230 M287 205 L282 230" stroke="#b45309" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Chubby Belly Fold & Patch -->
      <ellipse cx="256" cy="390" rx="90" ry="55" fill="#fef3c7"/>
      <path d="M210 375 Q256 395 302 375" stroke="#d97706" stroke-width="8" stroke-linecap="round" fill="none"/>

      <!-- Paws -->
      <ellipse cx="195" cy="435" rx="28" ry="18" fill="#fef3c7" stroke="#78350f" stroke-width="8"/>
      <ellipse cx="317" cy="435" rx="28" ry="18" fill="#fef3c7" stroke="#78350f" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="150" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="362" cy="305" rx="22" ry="14" fill="#fb7185" opacity="0.6"/>

      <!-- Relaxed Squinting Line Eyes (-_-) -->
      <path d="M180 265 L230 265" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>
      <path d="M282 265 L332 265" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>

      <!-- Nose and Mouth -->
      <polygon points="256,285 250,277 262,277" fill="#f43f5e"/>
      <path d="M242 292 C248 302 256 302 256 292 C256 302 264 302 270 292" fill="none" stroke="#78350f" stroke-width="7" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M110 295 L150 300 M105 315 L150 312 M402 295 L362 300 M407 315 L362 312" stroke="#78350f" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 15. Pure Snow White Smiling Cat
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(236,72,153,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#ffffff" stroke="#1e293b" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (Pure Snow White) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#ffffff" stroke="#1e293b" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears (Gentle Pink) -->
      <polygon points="152,145 190,205 155,205" fill="#fbcfe8"/>
      <polygon points="360,145 322,205 357,205" fill="#fbcfe8"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#1e293b" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#ffffff" stroke="#1e293b" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="170" cy="305" rx="20" ry="12" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="342" cy="305" rx="20" ry="12" fill="#fb7185" opacity="0.6"/>

      <!-- Happy Cartoon Eyes -->
      <circle cx="205" cy="265" r="26" fill="#1e293b"/>
      <circle cx="307" cy="265" r="26" fill="#1e293b"/>
      <circle cx="197" cy="257" r="10" fill="#ffffff"/>
      <circle cx="299" cy="257" r="10" fill="#ffffff"/>
      <circle cx="217" cy="275" r="5" fill="#ffffff"/>
      <circle cx="319" cy="275" r="5" fill="#ffffff"/>

      <!-- Nose and Sweet Smile -->
      <polygon points="256,285 250,277 262,277" fill="#f43f5e"/>
      <path d="M238 288 C244 304 256 304 256 290 C256 304 268 304 274 288" fill="none" stroke="#1e293b" stroke-width="8" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 295 L165 300 M120 315 L165 312 M387 295 L347 300 M392 315 L347 312" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `,

  // 16. Earthy Brown Forehead Sweat Drop Kitty (😰)
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <g filter="drop-shadow(0 12px 24px rgba(239,68,68,0.25))">
      <!-- Sticker Cutout -->
      <path d="M130 110 L195 205 C215 198 297 198 317 205 L382 110 C410 160 410 240 405 270 C420 320 410 405 385 435 C350 465 162 465 127 435 C102 405 92 320 107 270 C102 240 102 160 130 110 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="16" stroke-linejoin="round"/>
      
      <!-- Tail -->
      <path d="M360 380 C430 380 445 280 405 250 C395 240 380 250 385 270 C410 290 400 350 350 350 Z" fill="#78350f" stroke="#291102" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Body (Earthy Brown) -->
      <path d="M145 130 L195 210 C215 202 297 202 317 210 L367 130 C395 175 395 250 390 280 C405 330 395 405 370 430 C340 455 172 455 142 430 C117 405 107 330 122 280 C117 250 117 175 145 130 Z" fill="#78350f" stroke="#291102" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Inner Ears -->
      <polygon points="152,145 190,205 155,205" fill="#fca5a5"/>
      <polygon points="360,145 322,205 357,205" fill="#fca5a5"/>

      <!-- Sweat Drop (Glistening cyan on forehead) -->
      <path d="M330 190 C340 175 355 200 350 215 C345 225 330 225 325 215 C320 205 325 198 330 190 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="4"/>
      <ellipse cx="332" cy="205" rx="3" ry="5" fill="#ffffff"/>

      <!-- Wide Startled Eyes (O.O) -->
      <circle cx="205" cy="270" r="30" fill="#ffffff"/>
      <circle cx="307" cy="270" r="30" fill="#ffffff"/>
      <circle cx="205" cy="270" r="18" fill="#020617"/>
      <circle cx="307" cy="270" r="18" fill="#020617"/>
      <circle cx="198" cy="264" r="6" fill="#ffffff"/>
      <circle cx="300" cy="264" r="6" fill="#ffffff"/>

      <!-- Paws -->
      <ellipse cx="205" cy="430" rx="26" ry="18" fill="#92400e" stroke="#291102" stroke-width="8"/>
      <ellipse cx="307" cy="430" rx="26" ry="18" fill="#92400e" stroke="#291102" stroke-width="8"/>

      <!-- Cheeks -->
      <ellipse cx="155" cy="315" rx="16" ry="10" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="357" cy="315" rx="16" ry="10" fill="#fb7185" opacity="0.6"/>

      <!-- Nervous Wavy Mouth -->
      <polygon points="256,295 250,287 262,287" fill="#f87171"/>
      <path d="M236 308 Q246 300 256 308 Q266 316 276 308" fill="none" stroke="#fef08a" stroke-width="7" stroke-linecap="round"/>

      <!-- Whiskers -->
      <path d="M125 305 L165 308 M120 325 L165 320 M387 305 L347 308 M392 325 L347 320" stroke="#fef08a" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>
  `
];

async function generateAll() {
  const publicDir = path.join(process.cwd(), 'public');
  const catsDir = path.join(publicDir, 'cats');
  
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(catsDir)) fs.mkdirSync(catsDir, { recursive: true });

  for (let i = 0; i < catsSvg.length; i++) {
    const svgBuffer = Buffer.from(catsSvg[i]);
    const num = i + 1;
    
    // Output /public/cats/cat-X.png and /public/cat-X.png
    const catSubPath = path.join(catsDir, `cat-${num}.png`);
    const catRootPath = path.join(publicDir, `cat-${num}.png`);

    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(catSubPath);

    fs.copyFileSync(catSubPath, catRootPath);
    console.log(`Generated cat-${num}.png successfully`);
  }
}

generateAll().catch(console.error);
