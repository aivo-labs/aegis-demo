<template>
  <div class="flex flex-col gap-6 w-full text-slate-100 font-sans">
    
    <!-- 1. BANDEAU D'EN-TÊTE DU FUZZER -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
          🔬
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-lg font-bold text-white tracking-tight">Aegis Interactive Fuzzer &amp; Entropy Lab</h2>
            <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              Moteur Local In-Browser
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Testez vos propres charges offensives ou validez l'innocuité de requêtes saines. Le moteur d'entropie et de canonicalisation s'exécute en <span class="text-emerald-400 font-mono font-bold">&lt; 0.25 ms</span> dans votre navigateur.
          </p>
        </div>
      </div>

      <!-- BOUTONS D'ACTION DU HEADER -->
      <div class="flex items-center gap-2.5 shrink-0 font-mono text-xs">
        <button
          @click="copyChallengeLink"
          class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-cyan-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Générer et copier un permalien de partage pour défier des pairs sur Reddit / Twitter"
        >
          <span>🔗</span>
          <span>{{ copiedLink ? 'Lien copié !' : 'Partager ce test' }}</span>
        </button>

        <button
          @click="runEvaluation"
          class="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <span>⚡</span>
          <span>Évaluer ({{ lastLatencyMs }} ms)</span>
        </button>
      </div>
    </div>

    <!-- TOAST DE NOTIFICATION COPIE LIEN -->
    <transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="copiedLink" class="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-2">
          <span>✓</span>
          <span>Permalien de challenge copié dans le presse-papiers ! Partagez cette URL avec vos pairs.</span>
        </div>
        <button @click="copiedLink = false" class="text-emerald-400 hover:text-white">✕</button>
      </div>
    </transition>

    <!-- 2. SCÉNARIOS PRÉ-CONFIGURÉS (PRESETS VIRAUX) -->
    <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
      <div class="flex items-center justify-between text-xs">
        <span class="font-mono text-slate-400 font-bold uppercase tracking-wider text-[11px]">
          🎯 Scénarios Pré-Configurés (Cliquez pour charger &amp; tester) :
        </span>
        <span class="text-[11px] font-mono text-slate-500">8 scénarios prêts à l'emploi</span>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in SANDBOX_PRESETS"
          :key="preset.id"
          @click="loadPreset(preset)"
          :class="[
            'px-3 py-1.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer',
            selectedPresetId === preset.id
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
              : 'bg-slate-950 hover:bg-slate-800/90 border-slate-800 text-slate-300 hover:text-white'
          ]"
          :title="preset.description"
        >
          <span>{{ preset.badge }}</span>
          <span>{{ preset.name }}</span>
        </button>
      </div>
    </div>

    <!-- 3. GRILLE DEUX COLONNES : FORMULAIRE D'INJECTION & RÉSULTAT DU POLICY ENFORCEMENT POINT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- COLONNE GAUCHE (5 COL) : ÉDITEUR DE REQUÊTE HTTP -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 class="text-sm font-bold font-mono text-slate-200 flex items-center gap-2">
              <span>📝</span> Paramètres de la Requête HTTP
            </h3>
            <span class="text-[10px] font-mono text-slate-500">RFC 7230</span>
          </div>

          <!-- LIGNE MÉTHODE + URL -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-mono text-slate-400 font-semibold">Méthode &amp; URI / Endpoint :</label>
            <div class="flex items-center gap-2">
              <select
                v-model="request.method"
                @change="triggerAutoEval"
                class="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>

              <input
                type="text"
                v-model="request.url"
                @input="triggerAutoEval"
                placeholder="/api/v1/search?q=..."
                class="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <!-- EN-TÊTES HTTP -->
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-mono text-slate-400 font-semibold">En-têtes HTTP (Headers) :</label>
              <button
                @click="addHeader"
                class="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                + Ajouter un en-tête
              </button>
            </div>

            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div
                v-for="(header, index) in headerList"
                :key="index"
                class="flex items-center gap-2"
              >
                <input
                  type="text"
                  v-model="header.key"
                  @input="onHeadersChange"
                  placeholder="Nom (ex: User-Agent)"
                  class="w-1/3 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  v-model="header.value"
                  @input="onHeadersChange"
                  placeholder="Valeur"
                  class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  @click="removeHeader(index)"
                  class="w-7 h-7 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-500 hover:text-rose-400 flex items-center justify-center font-mono text-xs cursor-pointer"
                  title="Supprimer cet en-tête"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- CORPS DE LA REQUÊTE (BODY) -->
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-mono text-slate-400 font-semibold">Corps brut de la requête (Body / Payload) :</label>
              <span class="text-[10px] font-mono text-slate-500">{{ request.body.length }} octets</span>
            </div>
            <textarea
              v-model="request.body"
              @input="triggerAutoEval"
              rows="5"
              placeholder="Contenu brut JSON, URL-encoded, XML ou shellcode..."
              class="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-y leading-relaxed"
            ></textarea>
          </div>

          <!-- LIMITATION VOLUMÉTRIQUE OPTIONNELLE -->
          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <div class="flex items-center gap-2">
              <span>Seuil Max Payload (Buffer Guard) :</span>
              <span class="text-white font-bold">{{ maxPayloadKb }} Ko</span>
            </div>
            <input
              type="range"
              min="1"
              max="256"
              v-model.number="maxPayloadKb"
              @input="triggerAutoEval"
              class="w-28 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <!-- COLONNE DROITE (7 COL) : VERDICT DU POLICY ENFORCEMENT POINT & CALCUL D'ENTROPIE -->
      <div class="lg:col-span-7 flex flex-col gap-5">
        
        <!-- CARTE DE VERDICT PRINCIPAL DU PEP -->
        <div
          v-if="result"
          :class="[
            'p-5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all',
            result.verdict === 'ALLOW'
              ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900/90 border-emerald-500/50 shadow-emerald-950/30'
              : result.verdict === 'SINKHOLE'
              ? 'bg-gradient-to-br from-violet-950/60 to-slate-900/90 border-violet-500/50 shadow-violet-950/30'
              : 'bg-gradient-to-br from-rose-950/60 to-slate-900/90 border-rose-500/50 shadow-rose-950/30'
          ]"
        >
          <!-- HEADER DU VERDICT -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div class="flex items-center gap-2.5">
              <span
                :class="[
                  'w-3 h-3 rounded-full',
                  result.verdict === 'ALLOW' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-ping'
                ]"
              ></span>
              <span class="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                Policy Enforcement Point (PEP) Verdict
              </span>
            </div>
            
            <div class="flex items-center gap-2 font-mono text-xs">
              <span class="text-slate-400">Latence d'évaluation :</span>
              <span class="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 font-bold border border-emerald-500/30">
                ⚡ {{ result.latencyMs }} ms
              </span>
            </div>
          </div>

          <!-- BADGE PRINCIPAL DU VERDICT -->
          <div class="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'px-3.5 py-1.5 rounded-xl font-mono text-sm font-extrabold flex items-center gap-2 border shadow-lg',
                  result.verdict === 'ALLOW'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : result.verdict === 'SINKHOLE'
                    ? 'bg-violet-600 text-white border-violet-400'
                    : 'bg-rose-500 text-white border-rose-400'
                ]"
              >
                <span>{{ result.verdict === 'ALLOW' ? '✓' : result.verdict === 'SINKHOLE' ? '🌐' : '✕' }}</span>
                <span>{{ result.verdict === 'ALLOW' ? 'HTTP 200 ALLOW' : result.verdict === 'SINKHOLE' ? 'DNS SINKHOLE 0.0.0.0' : `HTTP ${result.httpStatus} BLOCK` }}</span>
              </div>

              <div>
                <div class="text-base font-extrabold text-white tracking-tight">{{ result.ruleName }}</div>
                <div class="text-xs font-mono text-slate-400">Type de menace : {{ result.threatType }}</div>
              </div>
            </div>

            <!-- SCORE DE RISQUE GLOBAL -->
            <div class="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span class="text-xs font-mono text-slate-400">Score de Risque :</span>
              <span
                :class="[
                  'text-sm font-mono font-extrabold',
                  result.riskScore < 30 ? 'text-emerald-400' : result.riskScore < 70 ? 'text-amber-400' : 'text-rose-400'
                ]"
              >
                {{ result.riskScore }} / 100
              </span>
            </div>
          </div>

          <!-- MOTIF DU VERDICT -->
          <p class="mt-3.5 text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <strong class="text-slate-200">Justification mathématique :</strong> {{ result.patternDescription }}
          </p>
        </div>

        <!-- CARTE D'ANALYSE SPECTRALE D'ENTROPIE DE SHANNON H(X) -->
        <div v-if="result" class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-base">📊</span>
              <h3 class="text-sm font-bold font-mono text-white">Calculateur d'Entropie de Shannon H(X)</h3>
            </div>
            <span class="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Formule : H(X) = -Σ P(x) · log₂(P(x))
            </span>
          </div>

          <!-- JAUGE VISUELLE D'ENTROPIE (0 à 8 BITS/SYMBOLE) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <div class="flex items-center gap-2">
                <span class="text-slate-400">Valeur H(X) :</span>
                <span
                  :class="[
                    'text-base font-extrabold',
                    result.entropy.status === 'LOW_COMPLIANT'
                      ? 'text-emerald-400'
                      : result.entropy.status === 'NORMAL'
                      ? 'text-cyan-300'
                      : 'text-rose-400 animate-pulse'
                  ]"
                >
                  {{ result.entropy.value }} bits/symbole
                </span>
                <span class="text-slate-500 text-[10px]">(Max théorique : {{ result.entropy.maxTheoretical }})</span>
              </div>

              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                  result.entropy.status === 'LOW_COMPLIANT'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : result.entropy.status === 'NORMAL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                ]"
              >
                {{ result.entropy.statusLabel }}
              </span>
            </div>

            <!-- BARRE DE PROGRESSION AVEC SEUILS IDENTIFIÉS -->
            <div class="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <!-- SEUIL 2.8 BITS (VERT / CYAN) -->
              <div class="absolute top-0 bottom-0 left-[35%] w-0.5 bg-emerald-500/50 z-10" title="Seuil Conforme (< 2.8)"></div>
              <!-- SEUIL 4.5 BITS (ORANGE / ROUGE CRITIQUE) -->
              <div class="absolute top-0 bottom-0 left-[56.25%] w-0.5 bg-rose-500 z-10" title="Seuil Critique Obfuscation (> 4.5)"></div>

              <!-- BARRE REMPLIE D'ENTROPIE -->
              <div
                class="h-full transition-all duration-300 rounded-full"
                :style="{
                  width: `${Math.min((result.entropy.value / 8) * 100, 100)}%`,
                  backgroundColor: result.entropy.value < 2.8 ? '#10b981' : result.entropy.value < 4.5 ? '#06b6d4' : '#f43f5e'
                }"
              ></div>
            </div>

            <!-- LÉGENDE DES SEUILS EN DESSOUS -->
            <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>0 bit (Répétitif)</span>
              <span>2.8 bits (Texte naturel / REST)</span>
              <span>4.5 bits (Seuil critique)</span>
              <span>8 bits (Aléatoire parfait / Binaire)</span>
            </div>
          </div>

          <!-- DÉCOMPOSITION SPECTRALE DES CARACTÈRES (TABLEAU DE FRÉQUENCE) -->
          <div class="mt-1 space-y-2">
            <div class="text-[11px] font-mono text-slate-400 font-semibold flex items-center justify-between">
              <span>🔬 Décomposition des 10 symboles les plus fréquents (sur {{ result.entropy.sampleLength }} octets analysés) :</span>
              <span class="text-[10px] text-slate-500">{{ result.entropy.uniqueChars }} symboles distincts</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              <div
                v-for="item in result.entropy.topDistribution"
                :key="item.char"
                class="p-2 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col gap-1"
              >
                <div class="flex items-center justify-between">
                  <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-white font-bold text-[11px]">
                    {{ item.charDisplay }}
                  </span>
                  <span class="text-[10px] text-cyan-400 font-bold">{{ item.pct }}%</span>
                </div>
                <div class="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div class="h-full bg-cyan-400 rounded-full" :style="{ width: `${item.pct}%` }"></div>
                </div>
                <div class="text-[9px] text-slate-500 truncate">Gain: -{{ item.infoGain }}</div>
              </div>
            </div>
          </div>

          <!-- VERROU DE CANONICALISATION (ORIGINAL VS CANONICAL) -->
          <div class="mt-2 pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-semibold text-[11px]">🛡️ Canonicaliseur Multi-Passes (Verrou Roadmap n°2) :</span>
              <span
                :class="[
                  'text-[10px] font-bold px-2 py-0.5 rounded',
                  result.canonicalization.modified ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-950 text-slate-500'
                ]"
              >
                {{ result.canonicalization.modified ? `Obfuscation Démasquée (${result.canonicalization.passes} passes de décodage)` : 'Aucune modification nécessaire' }}
              </span>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 truncate">
              <span class="text-slate-500 select-none">Cible canonicalisée : </span>
              <span class="text-cyan-300 font-semibold">{{ result.evaluatedTarget }}</span>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  inspectSandboxRequest,
  SANDBOX_PRESETS,
  type SandboxRequest,
  type SandboxPreset,
  type SandboxInspectionResult,
} from '../../services/sandboxEngine';

const emit = defineEmits<{
  (e: 'payload-evaluated', result: SandboxInspectionResult, req: SandboxRequest): void;
}>();

// État de la requête
const request = reactive<SandboxRequest>({
  method: 'GET',
  url: '/api/v1/users?page=2&limit=50&sort=name_asc',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  },
  body: '',
});

interface HeaderRow {
  key: string;
  value: string;
}

const headerList = ref<HeaderRow[]>([
  { key: 'Accept', value: 'application/json' },
  { key: 'User-Agent', value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
]);

const maxPayloadKb = ref(64);
const selectedPresetId = ref<string>('clean-api');
const result = ref<SandboxInspectionResult | null>(null);
const lastLatencyMs = ref<number>(0.15);
const copiedLink = ref(false);

let debounceTimer: any = null;

function syncHeadersFromList() {
  const map: Record<string, string> = {};
  for (const h of headerList.value) {
    if (h.key.trim()) {
      map[h.key.trim()] = h.value;
    }
  }
  request.headers = map;
}

function onHeadersChange() {
  syncHeadersFromList();
  triggerAutoEval();
}

function addHeader() {
  headerList.value.push({ key: '', value: '' });
}

function removeHeader(index: number) {
  headerList.value.splice(index, 1);
  onHeadersChange();
}

function loadPreset(preset: SandboxPreset) {
  selectedPresetId.value = preset.id;
  request.method = preset.request.method;
  request.url = preset.request.url;
  request.body = preset.request.body;

  headerList.value = Object.entries(preset.request.headers).map(([key, value]) => ({ key, value }));
  syncHeadersFromList();

  runEvaluation();
}

function triggerAutoEval() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runEvaluation();
  }, 120);
}

function runEvaluation() {
  syncHeadersFromList();
  const res = inspectSandboxRequest(request, maxPayloadKb.value * 1024);
  result.value = res;
  lastLatencyMs.value = res.latencyMs;

  emit('payload-evaluated', res, { ...request });
}

// Fonction de partage d'URL de challenge
function copyChallengeLink() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();
  params.set('method', request.method);
  params.set('url', request.url);
  if (request.body) params.set('body', request.body);
  if (headerList.value.length > 0) {
    params.set('headers', JSON.stringify(request.headers));
  }
  if (selectedPresetId.value) {
    params.set('preset', selectedPresetId.value);
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(shareUrl).then(() => {
    copiedLink.value = true;
    setTimeout(() => {
      copiedLink.value = false;
    }, 4000);
  });
}

// Hydratation depuis les paramètres d'URL (si lien partagé)
function hydrateFromUrl() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const presetParam = params.get('preset');
  if (presetParam) {
    const found = SANDBOX_PRESETS.find((p) => p.id === presetParam);
    if (found) {
      loadPreset(found);
      return;
    }
  }

  const methodParam = params.get('method');
  const urlParam = params.get('url');
  const bodyParam = params.get('body');
  const headersParam = params.get('headers');

  if (methodParam || urlParam || bodyParam || headersParam) {
    if (methodParam) request.method = methodParam.toUpperCase();
    if (urlParam) request.url = urlParam;
    if (bodyParam) request.body = bodyParam;
    if (headersParam) {
      try {
        const parsed = JSON.parse(headersParam);
        headerList.value = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
        syncHeadersFromList();
      } catch (e) {}
    }
    selectedPresetId.value = 'custom';
  }

  runEvaluation();
}

onMounted(() => {
  hydrateFromUrl();
});
</script>
