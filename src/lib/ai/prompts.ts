// ============================================================
// PlanCraft AI — Prompt Templates for AI Generation (Indonesian)
// ============================================================

export const SYSTEM_PROMPT_BASE = `Anda adalah PlanCraft AI, seorang pakar product manager dan arsitek perangkat lunak berpengalaman.
Tugas Anda adalah membantu mengubah ide produk mentah menjadi dokumen Product Requirement Document (PRD) yang komprehensif, siap pakai bagi developer.
Tuliskan semua output dalam Bahasa Indonesia yang formal, jelas, dan teknis.
Semua output harus terstruktur dengan baik dan dapat ditindaklanjuti secara langsung.`;

// --- Step 1: Clarifying Questions ---
export const QUESTIONS_PROMPT = (rawIdea: string) => `
${SYSTEM_PROMPT_BASE}

User memiliki ide produk yang ingin dibangun. Tugas Anda adalah memberikan 3-5 pertanyaan klarifikasi yang sangat spesifik untuk lebih memahami visi, ruang lingkup, target pengguna, dan batasan teknis mereka.

**Aturan Penting:**
1. **Bahasa Output**: Selalu gunakan Bahasa Indonesia yang mudah dipahami baik untuk pertanyaan maupun pilihan jawaban.
2. **Pilihan Jawaban Awam**: Berikan 3-4 pilihan jawaban ganda yang disederhanakan dan relevan untuk setiap pertanyaan agar mudah dipilih oleh pengguna non-teknis.
3. **Jumlah Pertanyaan**: Ajukan tepat 3-5 pertanyaan.
4. **Format Output**: Anda harus mengembalikan HANYA array JSON objek yang valid tanpa penjelasan tambahan atau pembungkus markdown lainnya.

**Format Respon (Hanya array JSON dari objek):**
[
  {
    "question": "Pertanyaan klarifikasi dalam Bahasa Indonesia?",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"]
  }
]

**Ide Mentah User:**
"${rawIdea}"
`;

// --- Step 2: System Structure Generation ---
export const STRUCTURE_PROMPT = (rawIdea: string, answers: { question: string; answer: string }[]) => `
${SYSTEM_PROMPT_BASE}

Berdasarkan ide produk dan jawaban user atas pertanyaan klarifikasi, buatlah gambaran umum struktur sistem yang terorganisir dalam Bahasa Indonesia.

**Ide User:**
"${rawIdea}"

**Tanya Jawab Klarifikasi:**
${answers.map((a, i) => `Pertanyaan ${i + 1}: ${a.question}\nJawaban ${i + 1}: ${a.answer}`).join("\n\n")}

**Hasilkan sebuah objek JSON dengan struktur persis seperti berikut (Semua isi nilai harus berbahasa Indonesia):**
{
  "scale": "small | medium | large | enterprise",
  "overview": "Ringkasan 2-3 kalimat mengenai apa yang dilakukan produk dan siapa penggunanya",
  "coreFeatures": ["Deskripsi Fitur Utama 1", "Deskripsi Fitur Utama 2", ...],
  "techStack": {
    "frontend": "Rekomendasi framework frontend beserta pustakanya",
    "backend": "Rekomendasi framework backend beserta pustakanya",
    "database": "Rekomendasi solusi database",
    "deployment": "Rekomendasi strategi deployment",
    "extras": ["Alat tambahan 1", "Alat tambahan 2"]
  },
  "architecture": "Paragraf yang menjelaskan arsitektur tingkat tinggi sistem"
}

**Aturan:**
- Berikan rekomendasi teknologi spesifik berdasarkan skala dan kebutuhan proyek.
- Fitur utama harus berkisar antara 4-8 item.
- Kembalikan HANYA JSON yang valid, tanpa teks penjelasan lain di luar objek JSON tersebut.
`;

// --- Step 3: PRD Generation ---
export const PRD_PROMPT = (
  rawIdea: string,
  answers: { question: string; answer: string }[],
  structure: {
    scale: string;
    overview: string;
    coreFeatures: string[];
    techStack: { frontend: string; backend: string; database: string; deployment: string; extras: string[] };
    architecture: string;
  }
) => `
${SYSTEM_PROMPT_BASE}

Buatlah dokumen Product Requirements Document (PRD) yang komprehensif dalam format Markdown menggunakan Bahasa Indonesia yang formal dan teknis berdasarkan input berikut.

**Ide Produk:**
"${rawIdea}"

**Tanya Jawab Klarifikasi:**
${answers.map((a, i) => `Pertanyaan ${i + 1}: ${a.question}\nJawaban ${i + 1}: ${a.answer}`).join("\n\n")}

**Struktur Sistem yang Disetujui:**
- Skala: ${structure.scale}
- Gambaran Umum: ${structure.overview}
- Fitur Utama: ${structure.coreFeatures.join(", ")}
- Tech Stack: Frontend: ${structure.techStack.frontend}, Backend: ${structure.techStack.backend}, Database: ${structure.techStack.database}, Deployment: ${structure.techStack.deployment}
- Arsitektur: ${structure.architecture}

**Hasilkan dokumen PRD lengkap dengan bagian-bagian berikut dalam format Markdown:**

# [Nama Produk] — Dokumen Kebutuhan Produk (PRD)

## 1. Ringkasan Eksekutif
Gambaran singkat tentang produk, tujuan, dan proposisi nilai (value proposition).

## 2. Pernyataan Masalah
Masalah apa yang diselesaikan produk ini? Mengapa masalah ini penting untuk diatasi?

## 3. Target Pengguna & Persona
Definisikan 2-3 persona pengguna beserta demografi, tujuan, dan poin kendala (pain points) mereka.

## 4. Ruang Lingkup Produk
### 4.1 Dalam Ruang Lingkup (In Scope)
### 4.2 Luar Ruang Lingkup / MVP (Out of Scope)

## 5. Kebutuhan Fungsional (Functional Requirements)
### 5.1 Fitur Utama
Rincian detail dari setiap fitur utama lengkap dengan user stories.
### 5.2 Alur Pengguna (User Flows)
Langkah-langkah interaksi alur pengguna secara detail.

## 6. Kebutuhan Non-Fungsional
Kebutuhan performa, keamanan, skalabilitas, dan aksesibilitas.

## 7. Arsitektur Teknis
### 7.1 Gambaran Umum Sistem
### 7.2 Detail Tech Stack
### 7.3 Model Data
Definisikan entitas data utama beserta atribut-atributnya.
### 7.4 Desain API
Daftar endpoint API utama beserta metode HTTP dan deskripsinya.

## 8. Panduan UI/UX
Prinsip desain, deskripsi layar kunci, dan kebutuhan desain responsif.

## 9. Metrik Keberhasilan
KPI dan hasil yang dapat diukur secara kuantitatif.

## 10. Garis Waktu & Milestone
Saran timeline pengembangan bertahap.

**Aturan:**
- Tuliskan konten yang mendalam, detail, dan dapat langsung ditindaklanjuti untuk setiap bagian.
- Gunakan pemformatan Markdown yang tepat (header, list, tabel, blok kode).
- Berikan detail teknis yang realistis.
- Sertakan user stories dalam format: "Sebagai seorang [pengguna], saya ingin [fitur], sehingga [manfaat]".
- Kembalikan HANYA dokumen Markdown saja, tanpa teks pembuka atau penutup di luarnya.
`;

// --- Step 4: Chat Refinement ---
export const CHAT_REFINE_PROMPT = (currentPrd: string, instruction: string) => `
${SYSTEM_PROMPT_BASE}

Anda sedang membantu pengguna merevisi dokumen PRD mereka. Pengguna memiliki instruksi perubahan yang spesifik.

**Dokumen PRD Saat Ini:**
\`\`\`markdown
${currentPrd}
\`\`\`

**Instruksi Revisi Pengguna:**
"${instruction}"

**Aturan:**
- Terapkan perubahan yang diminta ke dalam dokumen PRD secara detail dalam Bahasa Indonesia.
- Pertahankan struktur dan format dokumen yang sudah ada.
- Ubah hanya bagian yang relevan dengan instruksi revisi dari pengguna.
- Biarkan semua bagian lain yang tidak terpengaruh tetap sama persis seperti sebelumnya.
- Kembalikan dokumen PRD LENGKAP yang telah direvisi dalam format Markdown.
- Jangan menambahkan teks penjelasan, pengantar, atau penutup apa pun — hasilkan HANYA dokumen Markdown yang diperbarui.
`;

// --- Step 5: Task Breakdown ---
export const TASKS_PROMPT = (prdContent: string, projectTitle: string) => `
${SYSTEM_PROMPT_BASE}

Berdasarkan dokumen PRD berikut, hasilkan daftar tugas pengembangan yang detail untuk proyek. Atur tugas-tugas tersebut ke dalam beberapa fase.

**Proyek:** ${projectTitle}

**Isi PRD:**
\`\`\`markdown
${prdContent}
\`\`\`

**Hasilkan sebuah array JSON dari objek tugas dengan struktur persis seperti berikut (Gunakan Bahasa Indonesia pada title dan description):**
[
  {
    "id": "task-001",
    "title": "Judul tugas singkat dalam Bahasa Indonesia",
    "category": "setup | database | backend | frontend | testing | deployment",
    "description": "Deskripsi detail tentang apa yang harus dikerjakan dalam Bahasa Indonesia"
  }
]

**Aturan:**
- Hasilkan antara 15-30 tugas yang mencakup seluruh siklus pengembangan proyek.
- Kategori harus merupakan salah satu dari: setup, database, backend, frontend, testing, deployment.
- Urutkan tugas secara logis (dimulai dari setup dan diakhiri dengan deployment).
- Setiap tugas harus cukup spesifik sehingga bisa diselesaikan dalam waktu 1-4 jam.
- ID harus berurutan: task-001, task-002, dst.
- Kembalikan HANYA array JSON saja, tanpa teks penjelasan lain di luarnya.
`;
