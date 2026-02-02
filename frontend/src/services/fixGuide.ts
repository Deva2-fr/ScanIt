export interface FixGuide {
    title: string;
    description: string;
    steps: string[];
    codeSnippet?: string;
    resources?: { label: string; url: string }[];
}

export const FIX_GUIDES: Record<string, FixGuide> = {
    // SECURITY
    "SSL": {
        title: "Comment installer un certificat SSL ?",
        description: "Un certificat SSL crypte les données entre vos utilisateurs et votre site. C'est indispensable (le cadenas vert).",
        steps: [
            "Si vous êtes chez un hébergeur (OVH, Ionos...) : Activez l'option 'SSL' ou 'HTTPS' dans votre panneau de configuration.",
            "Si vous avez votre propre serveur (VPS) : Utilisez Certbot (Let's Encrypt) gratuit.",
            "Redirigez tout le trafic HTTP vers HTTPS dans votre configuration serveur."
        ],
        codeSnippet: `# Exemple Nginx (Redirection HTTPS)
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}`,
        resources: [{ label: "Guide Certbot", url: "https://certbot.eff.org/" }]
    },
    "En-tête manquant": {
        title: "Ajouter les en-têtes de sécurité HTTP",
        description: "Les en-têtes HTTP disent au navigateur comment se protéger (contre les iframes malveillantes, le vol de cookie, etc.).",
        steps: [
            "Identifiez votre serveur web (Nginx, Apache, ou Vercel/Netlify).",
            "Ajoutez les lignes suivantes dans votre fichier de configuration.",
            "Redémarrez le serveur."
        ],
        codeSnippet: `# Nginx (dans server block)
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self' https:;";`,
    },
    "SPF": {
        title: "Configurer l'enregistrement SPF",
        description: "SPF empêche les pirates d'envoyer des emails avec votre nom de domaine.",
        steps: [
            "Allez dans la zone DNS de votre domaine (chez votre registrar).",
            "Ajoutez un enregistrement de type TXT.",
            "Si vous n'utilisez que Google Workspace, mettez: 'v=spf1 include:_spf.google.com ~all'",
            "Sinon, utilisez un générateur SPF pour inclure vos outils d'envoi."
        ],
        codeSnippet: `Type: TXT
Nom: @
Valeur: v=spf1 include:_spf.google.com ~all`,
    },
    "DMARC": {
        title: "Configurer DMARC",
        description: "DMARC dit à Gmail/Yahoo de mettre en spam les emails qui usurpent votre identité.",
        steps: [
            "Allez dans votre zone DNS.",
            "Ajoutez un enregistrement TXT sous le nom '_dmarc'.",
            "Commencez par une politique 'none' (p=none) pour tester, puis passez à 'reject' (p=reject) pour sécuriser.",
        ],
        codeSnippet: `Type: TXT
Nom: _dmarc
Valeur: v=DMARC1; p=none; rua=mailto:admin@votre-domaine.com`,
    },
    "Git": {
        title: "Protéger le dossier .git",
        description: "Votre dossier .git contient tout votre code source et votre historique. Il ne doit JAMAIS être public !",
        steps: [
            "Supprimez le dossier .git du dossier public de votre serveur (il ne devrait être que dans votre dossier de développement).",
            "Ou bloquez son accès via la configuration serveur."
        ],
        codeSnippet: `# Nginx
location ~ /\.git {
    deny all;
}`,
    },
    ".env": {
        title: "Cacher le fichier .env",
        description: "Le fichier .env contient vos mots de passe. S'il est accessible, vous êtes piraté.",
        steps: [
            "Ne mettez JAMAIS le fichier .env dans le dossier 'public' ou 'html'.",
            "Il doit être à la racine du projet, un niveau au-dessus du dossier public.",
            "Ajoutez une règle pour bloquer l'accès aux fichiers cachés."
        ],
        codeSnippet: `# Apache (.htaccess)
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>`,
    },

    // SEO
    "Title": {
        title: "Optimiser la balise Title",
        description: "Le titre est ce qui s'affiche en bleu dans Google. Il doit être accrocheur et contenir vos mots clés.",
        steps: [
            "Ouvrez le fichier HTML de la page ou votre CMS (WordPress/Yoast).",
            "Trouvez la balise <title> dans le <head>.",
            "Rédigez un titre entre 50 et 60 caractères."
        ],
        codeSnippet: `<head>
  <title>Mot Clé Principal - Nom de la Marque</title>
</head>`,
    },
    "Description": {
        title: "Ajouter une Meta Description",
        description: "C'est le petit texte gris sous le lien Google. Il donne envie de cliquer.",
        steps: [
            "Ajoutez une balise meta name='description' dans le <head>.",
            "Faites un résumé unique de 130 à 150 caractères."
        ],
        codeSnippet: `<meta name="description" content="Découvrez nos services d'audit..." />`,
    },
    "Alt": {
        title: "Ajouter des textes alternatifs (Alt)",
        description: "Google ne 'voit' pas les images. Le texte Alt lui décrit ce qu'il y a dessus (et aide les malvoyants).",
        steps: [
            "Repérez les balises <img> sans attribut 'alt'.",
            "Ajoutez alt='Description de l image'.",
        ],
        codeSnippet: `<img src="chat.jpg" alt="Un chaton mignon qui dort" />`,
    },

    // TECH / PERF
    "LCP": {
        title: "Améliorer le LCP (Vitesse de chargement)",
        description: "Le LCP est le temps que met le plus gros élément (image/texte) à s'afficher. Il doit être < 2.5s.",
        steps: [
            "Optimisez la taille des images (WebP, compression).",
            "Utilisez un CDN.",
            "Mettez en cache les ressources statiques.",
            "Évitez les gros fichiers JavaScript bloquants."
        ]
    },
    "obsolète": {
        title: "Mettre à jour vos technologies",
        description: "Utiliser des vieilles versions (jQuery, PHP 5...) expose à des failles de sécurité.",
        steps: [
            "Identifiez la librairie obsolète.",
            "Mettez à jour via npm, composer ou votre gestionnaire de paquet.",
            "Vérifiez que votre site fonctionne toujours après la mise à jour."
        ]
    }

    // Add generic fallback if needed
};

export function getFixGuide(errorLabel: string): FixGuide | null {
    for (const [key, guide] of Object.entries(FIX_GUIDES)) {
        if (errorLabel.toLowerCase().includes(key.toLowerCase())) {
            return guide;
        }
    }
    return {
        title: "Analyse manuelle requise",
        description: "Cette erreur est spécifique. Consutez la documentation de votre technologie pour la résoudre.",
        steps: ["Recherchez le code d'erreur sur Google.", "Consultez un développeur expert."]
    };
}
