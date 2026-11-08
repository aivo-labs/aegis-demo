// translations.ts — Système de traduction bilingue EN (Défaut) / FR (Préfixe /fr/)

export type Locale = 'en' | 'fr';

export const defaultLocale: Locale = 'en';

export const locales: Locale[] = ['en', 'fr'];

export const translations = {
  en: {
    nav: {
      tagline: 'SOVEREIGN CYBERSECURITY',
      resources: 'Resources',
      docs: 'Documentation',
      docsDesc: 'Guides & Architecture',
      blog: 'Blog',
      blogDesc: 'Research & Threat Intel',
      discord: 'Discord',
      discordDesc: 'SecOps Community',
      getStarted: 'Get Started',
      partners: 'Become a Partner',
      designPartner: 'Design Partner',
      login: 'Login',
      themeDark: 'Dark Mode',
      themeLight: 'Light Mode',
      rgesnTooltipTitle: 'Recommended Dark Mode (RGESN 4.15)',
      rgesnTooltipText: 'Dark theme is active by default to reduce OLED/AMOLED screen energy consumption by 15% to 30%. Light theme remains available for bright environments.',
      footerTagline: '• Sovereign Cybersecurity & Hardware Frugality (AGPLv3)',
      footerDocs: 'Documentation',
      footerPartners: 'Become a Partner',
      footerGetStarted: 'Get Started (Audit & Setup)',
      footerLogin: 'SOC Login',
      footerLegal: 'Legal Notice & Privacy Policy',
    },
    hero: {
      sub: 'Sovereign Cybersecurity & Hardware Frugality',
      headline: "Ingress Zero-Trust Gateway (<span class=\"text-emerald-400 font-mono font-semibold\">&lt; 1.5 ms</span>), DNS exfiltration mitigation via local <span class=\"text-white font-mono font-semibold\">Nimble 9B Air-Gapped</span> SLM, and raw hardware telemetry (<span class=\"text-teal-300 font-mono font-semibold\">Watts/Joules RAPL &amp; Kepler</span>). Zero SaaS per-seat tax.",
      tabs: {
        vps: 'VPS / Single-Server',
        baremetal: 'Dedicated (Bare-Metal)',
        k8s: 'K8s Cluster',
        git: 'Testbench (Git)',
      },
      copy: 'Copy',
      copied: 'Copied!',
      proofs: {
        sovereign: '100% Sovereign',
        sovereignSub: 'Cloud Act Immune',
        open: 'Open AGPLv3',
        openSub: 'Open Code & Audit',
        esg: 'EFRAG VS Standard',
        esgSub: 'RGESN 2024 Compliant',
        anssi: 'ANSSI Hardened',
        anssiSub: 'NIS 2 & DORA Ready',
      },
    },
    plugAndPlay: {
      badge: 'PLUG & PLAY INTEGRATION • FOOTPRINT < 200 MB RAM',
      title: "Don't replace your existing stack.<br/><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400\">Add a lightweight sovereign overlay.</span>",
      desc: 'Aegis is not meant to replace proven tools like <strong>CrowdSec</strong>, <strong>Fail2ban</strong>, or your cloud firewall, nor to burden your infrastructure with power-hungry JVM or Python daemons. Written in <strong>Go and Rust</strong>, Aegis deploys in seconds as an ultra-frugal overlay.',
      card1Title: '100% Complementary to CrowdSec',
      card1Desc: 'While <strong>CrowdSec</strong> excels at community IP reputation and asynchronous log analysis, <strong>Aegis</strong> operates in-line (<code class="text-emerald-300 font-mono">&lt; 1.5 ms</code>) to block first-packet Zero-Days (Virtual Patching) and cut outbound C2 exfiltrations.',
      card2Title: 'Native Go & Rust Binaries (< 200 MB)',
      card2Desc: 'No heavy virtual machines or complex runtimes. The Control Plane in <strong>Go</strong> and the <strong>Rust RAPL</strong> probe consume less than <strong>2 Watts</strong> on a standard VPS while processing thousands of requests per second.',
      card3Title: 'Plug & Play Without Touching Code',
      card3Desc: 'Deploy Aegis in front of any existing application (WordPress, Symfony, Laravel, Node.js, Next.js, Go) without altering a single line of your source code, with 1-click fallback.',
      insertionLabel: 'Insertion Architecture:',
      insertionDesc: 'Compatible with Nginx, Traefik, Caddy, HAProxy, Docker & Kubernetes.',
      stepInternet: 'Internet / Cloudflare',
      stepCrowdsec: 'CrowdSec / Firewall',
      stepAegis: '🛡️ Aegis Overlay',
      stepApp: 'Your Application',
    },
    community: {
      badge: 'OPEN SOURCE ECOSYSTEM & THREAT INTEL',
      title: 'Join the sovereign digital resilience movement.',
      desc: 'Aegis is developed transparently under the AGPLv3 license. Collaborate with cybersecurity engineers, CIOs, and sustainable IT specialists.',
      githubTitle: 'Source Code on GitHub',
      githubDesc: 'Explore the monorepo, inspect eBPF probes, and audit WAF rules. Submit PRs and report vulnerabilities.',
      discordTitle: 'Discord Community',
      discordBadge: 'Engineers Room',
      discordDesc: 'Exchange directly with Nicolas Baud and security engineers. Share benchmarks on Dokploy, Scaleway/OVH VPS, and Kubernetes.',
      substackTitle: 'The Cyber & Frugal Watch',
      substackBadge: 'Weekly',
      substackDesc: 'Strategic monitoring on the NIS 2 directive, ANSSI hardening, the European VS standard (EFRAG), and on-premise Air-Gapped AI.',
      substackSubscribe: 'Subscribe on Substack',
      blogHeader: 'Publications & Insights',
      blogTitle: 'Latest Technical Analyses',
      blogAll: 'Read all articles on AIVO.fr',
      article1Category: 'Regulation',
      article1ReadTime: '6 min read',
      article1Title: 'NIS 2 Directive & EFRAG VS Standard: How to audit and harden SME IT in 2026',
      article1Desc: 'Why enterprise clients now demand physical proof of cyber hygiene and EFRAG carbon accounting, eliminating inaccurate financial proxies.',
      article2Category: 'Green IT & RAPL',
      article2ReadTime: '5 min read',
      article2Title: 'RAPL Hardware Metering vs Spend Ratios: Why traditional carbon reporting misleads',
      article2Desc: 'Technical demonstration: how Intel/AMD RAPL hardware counters and Kepler eBPF capture true physical Joules where financial proxies fail.',
      article3Category: 'FinOps & Sovereignty',
      article3ReadTime: '7 min read',
      article3Title: 'The "SaaS Tax" is suffocating SMEs: Why we banned per-seat pricing',
      article3Desc: 'An unvarnished financial analysis of the true cost of US enterprise suites. How to switch to a predictable server-based model with unlimited users.',
      readArticle: 'Read analysis',
      byAuthor: 'By Nicolas Baud',
    },
    faq: {
      badge: 'FREQUENT CIO & EXECUTIVE QUESTIONS',
      title: 'Clear answers to your security and compliance requirements.',
      desc: 'A transparent, documented architecture with zero gray areas.',
      items: [
        {
          q: "What is the actual impact of Aegis on application response times (network latency)?",
          a: "The impact is virtually undetectable: the Ingress PEP gateway adds less than 1.5 ms of latency thanks to an in-memory pre-compiled regular expression engine. Unlike US cloud proxies that impose geographical rerouting and external TLS decryption, Aegis inspects packets directly on your host infrastructure right next to your containers."
        },
        {
          q: "Why is RAPL / Kepler hardware metering essential for 2026 ESG requirements?",
          a: "The European VS standard (EFRAG) and CSRD-audited organizations increasingly reject 'monetary spend ratios' (which multiply hosting bills by theoretical averages). Aegis extracts raw physical Joules and Watts directly from Intel/AMD RAPL silicon registers and eBPF CPU counters, delivering verifiable, audit-proof data to financial and sustainability auditors."
        },
        {
          q: "How does the Nimble 9B AI engine operate in Air-Gapped mode without external data leaks?",
          a: "The specialized Nimble 9B language model runs entirely locally (via an on-premise Ollama container on CPU or GPU). All intent analysis and DGA entropy detections occur inside your private network boundary. Zero tokens, zero prompts, and zero logs ever pass through OpenAI, Microsoft Azure, or servers subject to the US CLOUD Act."
        },
        {
          q: "Do I need to install software agents on all employee workstations?",
          a: "No, absolutely not. Aegis operates at the network perimeter and on server hosts (Ingress WAF gateway and outbound Egress DNS resolver). Your collaborators do not have to install any heavy background software on their Mac, Windows, or Linux laptops. Workstations remain 100% fluid and employee privacy is fully preserved (Zero-Log)."
        },
        {
          q: "How does Kubernetes Namespace energy attribution work?",
          a: "Aegis deploys a DaemonSet combining the Kepler eBPF probe with a sovereign forwarder. Kepler inspects hardware CPU counters and distributes physical energy consumption across each cgroup and namespace (production, staging, monitoring). This allows DevOps teams to assign Watt quotas and quantify the exact impact of each microservice."
        },
        {
          q: "What is the difference between the AGPLv3 Community edition and AIVO enterprise support?",
          a: "100% of the Aegis suite is open source under the AGPLv3 license with zero feature gating or artificial throttling. The AIVO Enterprise offering delivers turnkey managed operations, 24/7 on-call SLA support, customized ANSSI hardening configurations, and dedicated compliance assistance during NIS 2 and EFRAG VS audits."
        }
      ]
    },
    closingCta: {
      title: 'Ready to assess your IT security posture and footprint?',
      desc: 'Run your free passive audit in seconds or get in touch with our team for guided on-premise deployment.',
      getStarted: 'Get Started',
      contactUs: 'Contact Us',
    },
    login: {
      title: 'Sovereign Space Login',
      sub: 'Aegis SOC Administration Cockpit',
      badge: 'On-Premise',
      emailLabel: 'SOC Username / Email',
      passwordLabel: 'Master Password',
      demoTip: '💡 <strong>Active Demo Mode:</strong> Credentials are prefilled. Click <em>"Sign In"</em> to immediately access the live Cockpit with genuine real-time telemetry.',
      submitBtn: 'Sign In to Cockpit',
      connecting: 'Securely signing in...',
      redirecting: 'Authentication verified. Redirecting to Cockpit...',
      footerStatus: 'Aegis Security Gateway • Air-Gapped Sovereign Architecture',
      footerLicense: 'Open-Core AGPLv3 License • ANSSI & NIS 2 Ready',
    }
  },
  fr: {
    nav: {
      tagline: 'CYBERSÉCURITÉ SOUVERAINE',
      resources: 'Ressources',
      docs: 'Documentation',
      docsDesc: 'Guides & Architecture',
      blog: 'Blog',
      blogDesc: 'Études & Veille Cyber',
      discord: 'Discord',
      discordDesc: 'Communauté SecOps',
      getStarted: 'Get Started',
      partners: 'Devenir partenaire',
      designPartner: 'Design Partner',
      login: 'Connexion',
      themeDark: 'Mode Sombre',
      themeLight: 'Mode Clair',
      rgesnTooltipTitle: 'Mode Sombre Préconisé (RGESN 4.15)',
      rgesnTooltipText: 'Le thème sombre est activé par défaut car il réduit de 15 % à 30 % la consommation électrique des écrans OLED/AMOLED. Le mode clair reste disponible pour le confort en environnement lumineux.',
      footerTagline: '• Cybersécurité Souveraine & Sobriété Matérielle (AGPLv3)',
      footerDocs: 'Documentation',
      footerPartners: 'Devenir Partenaire',
      footerGetStarted: 'Get Started (Audit & Setup)',
      footerLogin: 'Connexion SOC',
      footerLegal: 'Mentions Légales & RGPD',
    },
    hero: {
      sub: 'Cybersécurité Souveraine & Sobriété Matérielle',
      headline: "Passerelle Ingress Zero-Trust (<span class=\"text-emerald-400 font-mono font-semibold\">&lt; 1.5 ms</span>), blocage d'exfiltration DNS par IA locale <span class=\"text-white font-mono font-semibold\">Nimble 9B Air-Gapped</span>, et télémétrie matérielle brute (<span class=\"text-teal-300 font-mono font-semibold\">Watts/Joules RAPL &amp; Kepler</span>). Zéro taxe SaaS par siège.",
      tabs: {
        vps: 'VPS / Mono-Serveur',
        baremetal: 'Dédié (Bare-Metal)',
        k8s: 'Cluster K8s',
        git: "Banc d'Essai (Git)",
      },
      copy: 'Copier',
      copied: 'Copié !',
      proofs: {
        sovereign: '100% Souverain',
        sovereignSub: 'Immunisé Cloud Act',
        open: 'Libre AGPLv3',
        openSub: 'Audit & Code ouverts',
        esg: 'Norme VS (EFRAG)',
        esgSub: 'Conforme RGESN 2024',
        anssi: 'Durcissement ANSSI',
        anssiSub: 'Prêt pour NIS 2 & DORA',
      },
    },
    plugAndPlay: {
      badge: 'INTÉGRATION PLUG & PLAY • EMPREINTE < 200 MO RAM',
      title: "Ne remplacez pas votre existant.<br/><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400\">Ajoutez une surcouche légère et souveraine.</span>",
      desc: "Aegis n'a pas vocation à remplacer des outils éprouvés comme <strong>CrowdSec</strong>, <strong>Fail2ban</strong> ou votre pare-feu cloud, ni à alourdir votre SI avec des agents JVM/Python énergivores. Développé en <strong>Go et Rust</strong>, Aegis s'insère en quelques secondes comme une surcouche ultra-frugale.",
      card1Title: '100% Complémentaire à CrowdSec',
      card1Desc: "Là où <strong>CrowdSec</strong> excelle sur la réputation IP communautaire et l'analyse de logs à froid, <strong>Aegis</strong> agit en coupure temps réel (<code class=\"text-emerald-300 font-mono\">&lt; 1.5 ms</code>) pour bloquer le premier paquet Zero-Day (Virtual Patching) et couper les exfiltrations sortantes C2.",
      card2Title: 'Binaire Natif Go & Rust (< 200 Mo)',
      card2Desc: 'Aucune machine virtuelle lourde ni dépendance complexe. Le Control Plane en <strong>Go</strong> et la sonde <strong>Rust RAPL</strong> consomment moins de <strong>2 Watts</strong> sur un VPS standard tout en traitant des milliers de requêtes par seconde.',
      card3Title: 'Plug & Play sans toucher au code',
      card3Desc: 'Déployez Aegis devant n\'importe quelle application existante (WordPress, Symfony, Laravel, Node.js, Next.js, Go) sans modifier une seule ligne de votre code source, avec désactivation en 1 clic.',
      insertionLabel: "Architecture d'insertion :",
      insertionDesc: 'Compatible Nginx, Traefik, Caddy, HAProxy, Docker & Kubernetes.',
      stepInternet: 'Internet / Cloudflare',
      stepCrowdsec: 'CrowdSec / Pare-feu',
      stepAegis: '🛡️ Surcouche Aegis',
      stepApp: 'Votre Application',
    },
    community: {
      badge: 'ÉCOSYSTÈME OPEN SOURCE & VEILLE TECHNIQUE',
      title: 'Rejoignez le mouvement de la souveraineté numérique.',
      desc: 'Aegis est développé en toute transparence sous licence AGPLv3. Collaborez avec des ingénieurs cyber, des DSI et des spécialistes du numérique responsable.',
      githubTitle: 'Code Source sur GitHub',
      githubDesc: 'Explorez le monorepo, inspectez les sondes eBPF et auditez les règles WAF. Soumettez des PRs et signalez des vulnérabilités.',
      discordTitle: 'Communauté Discord',
      discordBadge: 'Salon Ingénieurs',
      discordDesc: "Échangez directement avec Nicolas Baud et les ingénieurs cyber. Retours d'expériences sur Dokploy, VPS Scaleway/OVH et Kubernetes.",
      substackTitle: 'La Vigie Cyber & Frugale',
      substackBadge: 'Hebdomadaire',
      substackDesc: "Veille stratégique sur la directive NIS 2, le durcissement ANSSI, la norme européenne VS (EFRAG) et l'IA locale Air-Gapped.",
      substackSubscribe: "S'abonner sur Substack",
      blogHeader: 'Publications & Débats',
      blogTitle: 'Les dernières analyses techniques',
      blogAll: 'Consulter tous les articles sur AIVO.fr',
      article1Category: 'Réglementation',
      article1ReadTime: '6 min de lecture',
      article1Title: 'Directive NIS 2 & Norme VS : Comment auditer et durcir le SI de sa PME en 2026',
      article1Desc: "Pourquoi les donneurs d'ordres exigent désormais des preuves physiques de votre hygiène informatique et de votre bilan carbone EFRAG, sans possibilité de tricher avec des ratios monétaires.",
      article2Category: 'Green IT & RAPL',
      article2ReadTime: '5 min de lecture',
      article2Title: 'Mesure physique RAPL vs Ratios monétaires : Pourquoi le reporting carbone classique ment',
      article2Desc: 'Démonstration technique : comment les compteurs matériels Intel/AMD RAPL et Kepler eBPF restituent la réalité physique en Joules là où les ratios financiers trompent les bilans RSE.',
      article3Category: 'FinOps & Souveraineté',
      article3ReadTime: '7 min de lecture',
      article3Title: 'La "SaaS Tax" étouffe les PME : Pourquoi nous avons banni la tarification par siège',
      article3Desc: 'Une analyse financière sans filtre du coût réel des suites américaines Cloudflare, Zscaler et Auth0. Comment passer à un coût serveur fixe avec utilisateurs illimités.',
      readArticle: "Lire l'analyse",
      byAuthor: 'Par Nicolas Baud',
    },
    faq: {
      badge: 'QUESTIONS FRÉQUENTES DES DSI & DIRIGEANTS',
      title: 'Toutes les réponses à vos exigences de sécurité et de conformité.',
      desc: "Une architecture claire, documentée et sans zone d'ombre.",
      items: [
        {
          q: "Quel est l'impact réel d'Aegis sur les temps de réponse de mes applications (latence réseau) ?",
          a: "L'impact est quasiment indétectable : la passerelle Ingress PEP ajoute moins de 1.5 ms de latence grâce à un moteur d'expressions régulières pré-compilé en mémoire RAM. Contrairement aux proxys Cloud américains qui imposent un détour géographique et un déchiffrement hors d'Europe, Aegis traite les paquets directement sur votre infrastructure hôte au plus près de vos conteneurs."
        },
        {
          q: "Pourquoi la mesure matérielle RAPL / Kepler est-elle indispensable face aux nouvelles exigences ESG 2026 ?",
          a: "La norme européenne VS (EFRAG) et les donneurs d'ordres soumis à la CSRD rejettent désormais les 'ratios monétaires' (qui multiplient vos factures d'hébergement par des moyennes théoriques). Aegis extrait les Joules et Watts physiques bruts directement depuis les registres silicium Intel/AMD RAPL et les compteurs CPU eBPF, produisant des données scientifiques vérifiables et opposables aux commissaires aux comptes."
        },
        {
          q: "Comment fonctionne le moteur IA Nimble 9B en mode Air-Gapped sans fuite vers des APIs externes ?",
          a: "Le modèle de langage spécialisé Nimble 9B tourne intégralement en local (conteneur Ollama sur CPU ou GPU). Toutes les analyses d'intention et détections d'algorithmes DGA se font à l'intérieur de votre réseau privé. Zéro token, zéro prompt et zéro log ne transitent par OpenAI, Microsoft Azure ou des serveurs soumis au CLOUD Act américain."
        },
        {
          q: "Faut-il installer un agent logiciel sur chaque ordinateur de mes collaborateurs ?",
          a: "Non, absolument pas. Aegis agit au niveau du périmètre réseau et des serveurs d'entreprise (passerelle Ingress WAF et résolveur DNS sortant Egress). Vos collaborateurs n'ont aucun logiciel lourd ou ralentisseur à installer sur leurs machines Mac, Windows ou Linux. Vos postes de travail restent 100% fluides et leur vie privée est respectée (Zero-Log)."
        },
        {
          q: "Comment fonctionne l'attribution énergétique par Namespace sur Kubernetes ?",
          a: "Aegis déploie un DaemonSet combinant la sonde eBPF Kepler et un forwarder souverain. Kepler interroge les compteurs hardware du CPU et ventile précisément la consommation électrique réelle sur chaque cgroup et namespace (production, staging, monitoring). Cela permet aux équipes DevOps de fixer des quotas en Watts et de mesurer l'impact de chaque micro-service."
        },
        {
          q: "Quelle est la différence entre la version Community AGPLv3 et l'accompagnement AIVO ?",
          a: "100% de la suite Aegis est open source sous licence libre AGPLv3, sans bridage artificiel ni limitation de fonctionnalités. L'offre AIVO Entreprise fournit une infogérance souveraine clé-en-main, un support d'astreinte 24/7 avec SLA contractuel, le durcissement sur mesure selon les guides ANSSI et l'assistance lors des audits réglementaires NIS 2 et Norme VS."
        }
      ]
    },
    closingCta: {
      title: "Prêt à évaluer l'exposition et l'empreinte de votre SI ?",
      desc: "Lancez votre diagnostic passif gratuit en quelques secondes ou échangez avec nos ingénieurs pour un déploiement accompagné.",
      getStarted: 'Get Started',
      contactUs: 'Contact Us',
    },
    login: {
      title: 'Connexion Espace Souverain',
      sub: "Cockpit d'Administration SOC Aegis",
      badge: 'On-Premise',
      emailLabel: 'Identifiant / Email SOC',
      passwordLabel: 'Mot de Passe Master',
      demoTip: '💡 <strong>Mode Démonstration Actif :</strong> Les identifiants sont préremplis. Cliquez directement sur <em>« Se connecter »</em> pour accéder instantanément au cockpit connecté avec les métriques réelles en direct.',
      submitBtn: 'Se connecter au Cockpit',
      connecting: 'Connexion sécurisée en cours...',
      redirecting: 'Authentification validée. Redirection vers le Cockpit...',
      footerStatus: 'Aegis Security Gateway • Architecture Souveraine Air-Gapped',
      footerLicense: 'Licence Open-Core AGPLv3 • Conforme ANSSI & NIS 2',
    }
  }
};

export function useTranslations(lang: Locale = 'en') {
  return translations[lang] || translations.en;
}
