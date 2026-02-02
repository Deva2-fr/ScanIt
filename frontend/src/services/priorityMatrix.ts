import { SeverityLevel } from "@/types/api";

type Impact = "High" | "Medium" | "Low";
type Difficulty = "Easy" | "Medium" | "Hard";
type Category = "SEO" | "Security" | "Performance" | "Tech" | "GreenIT";

interface PriorityRule {
    impact: Impact;
    difficulty: Difficulty;
    category: Category;
    label: string;
}

// Map known error patterns (partial matches) to priority rules
const PRIORITY_MATRIX: Record<string, PriorityRule> = {
    // SECURITY - Often High Impact, varying difficulty
    "SSL": { impact: "High", difficulty: "Medium", category: "Security", label: "Certificat SSL Invalide" },
    "En-tête manquant": { impact: "Medium", difficulty: "Easy", category: "Security", label: "En-têtes de sécurité manquants" },
    "SPF": { impact: "High", difficulty: "Easy", category: "Security", label: "Configuration SPF Requise" },
    "DMARC": { impact: "High", difficulty: "Easy", category: "Security", label: "Configuration DMARC Manquante" },
    "Git": { impact: "High", difficulty: "Easy", category: "Security", label: "Dossier .git accessible public" },
    ".env": { impact: "High", difficulty: "Easy", category: "Security", label: "Fichier .env exposé" },

    // SEO - Basics are Easy/High Impact
    "SEO:": { impact: "Medium", difficulty: "Medium", category: "SEO", label: "Problème SEO détecté" }, // Generic Fallback
    "Title": { impact: "High", difficulty: "Easy", category: "SEO", label: "Balise Title manquante ou courte" },
    "Description": { impact: "High", difficulty: "Easy", category: "SEO", label: "Meta Description manquante" },
    "H1": { impact: "High", difficulty: "Easy", category: "SEO", label: "Structure H1 incorrecte" },
    "Alt": { impact: "Medium", difficulty: "Easy", category: "SEO", label: "Attributs Alt manquants sur images" },
    "Links:": { impact: "Medium", difficulty: "Medium", category: "SEO", label: "Liens brisés détectés" },

    // PERFORMANCE / TECH - Harder tasks
    "LCP": { impact: "High", difficulty: "Hard", category: "Performance", label: "Optimisation LCP (Vitesse)" },
    "CLS": { impact: "High", difficulty: "Hard", category: "Performance", label: "Stabilité Visuelle (CLS)" },
    "Slow": { impact: "High", difficulty: "Hard", category: "Performance", label: "Temps de réponse serveur lent" },
    "Tech:": { impact: "Medium", difficulty: "Hard", category: "Tech", label: "Mise à jour technologique requise" },
    "obsolète": { impact: "Medium", difficulty: "Hard", category: "Tech", label: "Technologie obsolète" },

    // GREEN IT / GDPR
    "GDPR": { impact: "High", difficulty: "Medium", category: "Security", label: "Mise en conformité RGPD" },
    "GreenIT": { impact: "Low", difficulty: "Medium", category: "GreenIT", label: "Optimisation Écologique" },

    // SOCIAL (SMO)
    "Social:": { impact: "Low", difficulty: "Easy", category: "SEO", label: "Optimisation Réseaux Sociaux" },
    "og:": { impact: "Medium", difficulty: "Easy", category: "SEO", label: "Balise Open Graph manquante" },
    "twitter:": { impact: "Low", difficulty: "Easy", category: "SEO", label: "Twitter Card manquante" },

    // GENERIC PERFORMANCE
    "Performance:": { impact: "High", difficulty: "Hard", category: "Performance", label: "Performance Globale Insuffisante" },
};

export interface RoadmapTask {
    id: string;
    originalError: string;
    label: string;
    impact: Impact;
    difficulty: Difficulty;
    category: Category;
    column: "quick-wins" | "projects" | "backlog";
    isDone: boolean;
}

export function categorizeError(errorText: string): RoadmapTask {
    // 1. Find matching rule
    let rule: PriorityRule = {
        impact: "Medium",
        difficulty: "Medium",
        category: "Tech",
        label: errorText
    };

    // Try to find specific match first
    for (const [key, val] of Object.entries(PRIORITY_MATRIX)) {
        if (errorText.toLowerCase().includes(key.toLowerCase())) {
            // Keep original text if it's specific (like "SEO: Title missing"), otherwise use generic label
            const label = errorText.includes(":") ? errorText.split(":").slice(1).join(":").trim() : (val.label || errorText);

            // Auto-detect category from prefix if present
            let category = val.category;
            if (errorText.startsWith("SEO:")) category = "SEO";
            if (errorText.startsWith("Security:")) category = "Security";
            if (errorText.startsWith("Social:")) category = "SEO"; // Social falls under SEO mostly
            if (errorText.startsWith("Performance:")) category = "Performance";
            if (errorText.startsWith("GreenIT:")) category = "GreenIT";

            rule = { ...val, label, category };
            break;
        }
    }

    // 2. Determine Column
    let column: "quick-wins" | "projects" | "backlog" = "backlog";

    // Logic: 
    // Quick Wins = High Impact + Easy Difficulty
    // Projects = High Impact + Hard Difficulty OR Medium Impact + Hard Difficulty
    // Backlog = Low Impact OR (Medium Impact + Easy/Medium Difficulty - actually let's refine)

    if (rule.impact === "High") {
        if (rule.difficulty === "Easy") {
            column = "quick-wins";
        } else {
            column = "projects";
        }
    } else if (rule.impact === "Medium") {
        if (rule.difficulty === "Easy") {
            // Let's call Medium/Easy a Quick Win too to encourage user
            column = "quick-wins";
        } else {
            column = "backlog";
        }
    } else {
        column = "backlog";
    }

    return {
        id: crypto.randomUUID(),
        originalError: errorText,
        label: rule.label,
        impact: rule.impact,
        difficulty: rule.difficulty,
        category: rule.category,
        column,
        isDone: false
    };
}

export function generateRoadmap(errors: string[]): RoadmapTask[] {
    // Deduplicate errors first based on text content roughly
    const uniqueErrors = Array.from(new Set(errors));
    return uniqueErrors.map(categorizeError);
}
