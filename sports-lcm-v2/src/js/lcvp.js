const authData = {
    "oGTeacher_talent": { fo: "oGT", lcvps: ["LCVP oGTa - Vihangi Ranaweera", "LCVP oGTe - Jayashni Rodrigo"] },
    "Catch_em_all": { fo: "iGT", lcvps: ["LCVP iGT B2B & CXP - Jemima Mohamed", "LCVP iGT M & IR - Tharuka Gunarathne"] },
    "The_GenVics": { fo: "oGV", lcvps: ["LCVP oGV B2C - Devmi Galagedara", "LCVP oGV PS - Sineli Thilakarathne"] },
    "StarTeamIGV": { fo: "iGV", lcvps: ["LCVP iGV B2B - Nayana Fernando", "LCVP iGV CXP - Dileepa Gayantha", "LCVP iGV M & IR - Navapriyah Krishnan"] }
};

// All 8 Colors verified and hexes mapped
const themeColors = {
    "Red": { main: "#e74c3c", darkBg: "#3a0505" },
    "Blue": { main: "#3498db", darkBg: "#05153a" },
    "Yellow": { main: "#f1c40f", darkBg: "#3a2a05" },
    "Green": { main: "#2ecc71", darkBg: "#052a10" },
    "Cyan": { main: "#00bcd4", darkBg: "#05253a" },
    "White": { main: "#ffffff", darkBg: "#222222" },
    "Black": { main: "#333333", darkBg: "#000000" },
    "Orange": { main: "#e67e22", darkBg: "#3a1505" }
};

let currentFO = "";

// DOM Elements
const loginContainer = document.getElementById("login-container");
const regContainer = document.getElementById("registration-container");
const loginBtn = document.getElementById("login-btn");
const passInput = document.getElementById("fo-password");
const loginError = document.getElementById("login-error");
const lcvpSelect = document.getElementById("lcvp-name");
const welcomeText = document.getElementById("welcome-text");
const teamForm = document.getElementById("team-form");
const teamNameInput = document.getElementById("team-name");
const mascotSelect = document.getElementById("team-mascot");
const submitBtn = document.getElementById("submit-btn");
const mascotWrapper = document.getElementById("mascot-wrapper");

// Visualizer Elements
const defaultBranding = document.getElementById("default-branding");
const dynamicThemeBox = document.getElementById("dynamic-theme-box");
const liveFoTitle = document.getElementById("live-fo-title");
const mascotImage = document.getElementById("team-mascot-img");
const teamNameDisplay = document.getElementById("team-name-display");
const colorSwatches = document.querySelectorAll('.color-swatch');
const teamColorInput = document.getElementById('team-color');

// --- 1. Login Logic ---
loginBtn.addEventListener("click", () => {
    const enteredPass = passInput.value.trim();
    
    if (authData[enteredPass]) {
        currentFO = authData[enteredPass].fo;
        const lcvpList = authData[enteredPass].lcvps;
        
        loginContainer.classList.add("hidden");
        regContainer.classList.remove("hidden");
        
        welcomeText.innerHTML = `WELCOME, <br><span class="text-[#FFB81C]">${currentFO} COMMANDER</span>`;
        liveFoTitle.innerText = `${currentFO} FACTION ACTIVE`;
        
        lcvpSelect.innerHTML = '<option value="" disabled selected>Identify Yourself...</option>';
        lcvpList.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.innerText = name;
            lcvpSelect.appendChild(option);
        });

        listenToTakenOptions();
    } else {
        loginError.classList.remove("hidden");
    }
});

// --- 2. Live UI Updates (Team Name) ---
teamNameInput.addEventListener("input", (e) => {
    const val = e.target.value.toUpperCase();
    if(val.length > 0) {
        defaultBranding.classList.add("hidden");
        dynamicThemeBox.classList.remove("hidden");
    }
    teamNameDisplay.innerText = val || "TEAM NAME";
});

// --- 3. Live UI Updates (Colors) ---
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        if (swatch.classList.contains('opacity-20')) return; // Block taken colors
        
        // Reset all swatches
        colorSwatches.forEach(s => {
            s.style.borderColor = "transparent";
            s.classList.remove('selected');
        });
        
        // Highlight selected swatch
        swatch.style.borderColor = "white";
        swatch.classList.add('selected');
        
        const selectedColor = swatch.getAttribute('data-color');
        teamColorInput.value = selectedColor;
        
        const theme = themeColors[selectedColor];
        if(theme) {
            // Inject CSS variables to drive the Hologram glowing effects
            document.documentElement.style.setProperty('--accent-color', theme.main);
            
            // Change the entire page background smoothly (fixes the cyan/orange bug)
            document.body.style.backgroundImage = `radial-gradient(ellipse at top, ${theme.darkBg}, #1A0524, #1A0524)`;
        }
        
        defaultBranding.classList.add("hidden");
        dynamicThemeBox.classList.remove("hidden");
    });
});

// --- 4. Live UI Updates (Mascot / Character Select) ---
mascotSelect.addEventListener('change', (e) => {
    const selectedMascot = e.target.value;
    if (selectedMascot) {
        defaultBranding.classList.add("hidden");
        dynamicThemeBox.classList.remove("hidden");
        
        // Load the image dynamically
        mascotImage.src = `/public/images/mascots/${selectedMascot.toLowerCase()}.png`;
        mascotWrapper.classList.remove("hidden");
        
        // Trigger the flash on the WRAPPER, leaving the IMAGE free to float
        mascotWrapper.classList.remove("animate-character-select");
        void mascotWrapper.offsetWidth; // Force DOM reflow to reset animation
        mascotWrapper.classList.add("animate-character-select");
    }
});

// --- 5. Firebase Real-Time Lockout Logic ---
function listenToTakenOptions() {
    db.collection("teams").onSnapshot((snapshot) => {
        const takenColors = [];
        const takenMascots = [];
        let isAlreadyRegistered = false;

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (doc.id === currentFO) {
                isAlreadyRegistered = true;
            } else {
                takenColors.push(data.color);
                takenMascots.push(data.mascot);
            }
        });

        // If the FO has already registered a team, replace the form with a lockout screen
        if (isAlreadyRegistered) {
            teamForm.innerHTML = `
                <div class="bg-red-500/10 border border-red-500 text-red-400 p-8 rounded-xl text-center mt-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <i class="fa-solid fa-lock text-4xl mb-4"></i>
                    <h3 class="font-freshman text-2xl mb-2 tracking-widest">IDENTITY LOCKED</h3>
                    <p class="text-xs uppercase tracking-widest">Your faction's champion has already been registered into the arena framework.</p>
                </div>
            `;
            return; 
        }

        // Lock out taken colors
        colorSwatches.forEach(swatch => {
            const swatchColor = swatch.getAttribute('data-color');
            if (takenColors.includes(swatchColor)) {
                swatch.classList.add('opacity-20', 'cursor-not-allowed', 'grayscale');
                swatch.style.pointerEvents = 'none';
                if (teamColorInput.value === swatchColor) teamColorInput.value = ""; 
            }
        });

        // Lock out taken mascots
        Array.from(mascotSelect.options).forEach(option => {
            if (option.value && takenMascots.includes(option.value)) {
                option.disabled = true;
                option.innerText = `${option.value} (TAKEN)`;
                option.classList.add("text-white/30");
            }
        });
    });
}

// --- 6. Form Submission Logic ---
teamForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!teamColorInput.value) {
        alert("COMMANDER: You must select an Aura Color before proceeding.");
        return;
    }

    const selectedLCVP = lcvpSelect.value;
    const teamName = teamNameInput.value.trim();
    const selectedColor = teamColorInput.value;
    const selectedMascot = mascotSelect.value;

    submitBtn.innerText = "UPLOADING TO MAINFRAME...";
    submitBtn.disabled = true;
    submitBtn.classList.add("animate-pulse");

    try {
        await db.collection("teams").doc(currentFO).set({
            registeredBy: selectedLCVP,
            fo: currentFO,
            teamName: teamName,
            color: selectedColor,
            mascot: selectedMascot,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        teamForm.innerHTML = `
            <div class="bg-[#2ecc71]/10 border border-[#2ecc71] text-[#2ecc71] p-8 rounded-xl text-center mt-6 shadow-[0_0_30px_rgba(46,204,113,0.2)]">
                <i class="fa-solid fa-check-circle text-4xl mb-4"></i>
                <h3 class="font-freshman text-2xl mb-2 tracking-widest">SUCCESS</h3>
                <p class="text-xs uppercase tracking-widest">Champion successfully registered to the arena mainframe.</p>
            </div>
        `;
        
    } catch (error) {
        console.error("Error adding document: ", error);
        submitBtn.innerText = "SYSTEM ERROR. RETRY.";
        submitBtn.disabled = false;
        submitBtn.classList.remove("animate-pulse");
    }
});