// --- Sub-team Data Architecture ---
const subTeams = {
    "iGV": ["iGV B2B", "iGV CXP", "iGV M & IR", "Other"],
    "iGT": ["iGT B2B & CXP", "iGT M & IR", "Other"],
    "oGV": ["oGV B2C", "oGV PS", "Other"],
    "oGT": ["oGTe", "oGTa", "Customer Relations (CR)", "IR & M", "Other"],
    "EB": ["Executive Board"],
    "IG": ["Initiative Group - Saegis Campus"],
    "Alumni": ["Alumni"]
};

// --- Advanced Dark Mode Tinting ---
const themeColors = {
    "Red": { main: "#e74c3c", darkBg: "#1a0505" },
    "Blue": { main: "#3498db", darkBg: "#050a1a" },
    "Green": { main: "#2ecc71", darkBg: "#051a0a" },
    "Yellow": { main: "#f1c40f", darkBg: "#1a1705" },
    "Orange": { main: "#e67e22", darkBg: "#1a0d05" },
    "Cyan": { main: "#00bcd4", darkBg: "#05171a" },
    "White": { main: "#ffffff", darkBg: "#111111" },
    "Black": { main: "#7f8c8d", darkBg: "#000000" }
};

// --- URL Parsing & DOM Setup ---
const urlParams = new URLSearchParams(window.location.search);
const entity = urlParams.get('entity') || "Unknown"; 

const entityTitle = document.getElementById('entity-title');
const subTeamSelect = document.getElementById('sub-team');
const subTeamGroup = document.getElementById('subteam-group');
const delegateForm = document.getElementById('delegate-form');
const successMessage = document.getElementById('success-message');
const submitBtn = document.getElementById('submit-btn');

const themeBox = document.getElementById('dynamic-theme-box');
const defaultBox = document.getElementById('default-theme-box');
const teamNameDisplay = document.getElementById('team-name-display');
const teamMascotImg = document.getElementById('team-mascot-img');

// Set the Title
if (entity === "EB" || entity === "Alumni" || entity === "IG") {
    entityTitle.innerText = `SPORTS LCM ${entity.toUpperCase()}`;
} else {
    entityTitle.innerText = `${entity} DELEGATE`;
}

// Populate Sub-teams dynamically
if (subTeams[entity]) {
    if (entity === "EB" || entity === "Alumni" || entity === "IG") {
        subTeamGroup.classList.add('hidden');
        const option = document.createElement("option");
        option.value = subTeams[entity][0];
        option.selected = true;
        subTeamSelect.appendChild(option);
    } else {
        subTeams[entity].forEach(team => {
            const option = document.createElement("option");
            option.value = team;
            option.innerText = team;
            subTeamSelect.appendChild(option);
        });
    }
} else {
    entityTitle.innerText = "INVALID LINK";
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50", "cursor-not-allowed");
}

// --- Dynamic Tailwind Chameleon Injection ---
function injectTailwindTheme(theme) {
    document.documentElement.style.setProperty('--accent-color', theme.main);
    document.documentElement.style.setProperty('--bg-dark', theme.darkBg);
    
    // Target specific new UI elements to glow with the team's color
    teamNameDisplay.style.color = theme.main;
    teamNameDisplay.style.textShadow = `0 0 20px ${theme.main}80`;
    
    submitBtn.style.backgroundColor = theme.main;
    submitBtn.style.color = "#1A0524"; // Keep text dark for contrast
    submitBtn.style.boxShadow = `0 0 20px ${theme.main}60`;
}

// --- Fetch & Apply Team Identity ---
async function applyTeamTheme() {
    
    // THE EB GRIFFINS OVERRIDE
    if (entity === "EB") {
        themeBox.classList.remove('hidden');
        defaultBox.classList.add('hidden');
        
        teamNameDisplay.innerText = "EB GRIFFINS";
        teamMascotImg.src = `/public/images/mascots/griffin.png`;

        const theme = themeColors["Yellow"]; 
        injectTailwindTheme(theme);
        return; 
    }

    // Standard Database Lookup for Main FOs
    if (["iGV", "iGT", "oGV", "oGT"].includes(entity)) {
        try {
            const doc = await db.collection("teams").doc(entity).get();
            
            if (doc.exists) {
                const teamData = doc.data();
                
                themeBox.classList.remove('hidden');
                defaultBox.classList.add('hidden');
                
                teamNameDisplay.innerText = teamData.teamName;
                teamMascotImg.src = `/public/images/mascots/${teamData.mascot.toLowerCase()}.png`;

                const theme = themeColors[teamData.color] || themeColors["White"];
                injectTailwindTheme(theme);
                
            } else {
                entityTitle.innerText = `${entity} IDENTITY NOT YET LOCKED`;
            }
        } catch (error) {
            console.error("Error fetching team data:", error);
        }
    }
}

applyTeamTheme();

// --- Handle Delegate Registration ---
delegateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.innerText = "ENCRYPTING DATA...";
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-75", "cursor-wait");

    const delegateData = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        whatsapp: document.getElementById('whatsapp').value.trim(),
        faction: entity,
        subTeam: subTeamSelect.value,
        role: document.getElementById('role').value,
        footballPosition: document.getElementById('football-position').value,
        confirmed: document.getElementById('confirmation').checked,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("delegates").add(delegateData);
        delegateForm.reset();
        submitBtn.classList.add("hidden");
        successMessage.classList.remove("hidden");
    } catch (error) {
        console.error("Error registering delegate: ", error);
        submitBtn.innerText = "SYSTEM ERROR. RETRY.";
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-75", "cursor-wait");
    }
});