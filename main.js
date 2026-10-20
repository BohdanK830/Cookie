const defaultColors = [
    { name: "red", type: "HEX", code: "#FF0000" },
    { name: "green", type: "RGB", code: "0, 255, 0" },
    { name: "blue", type: "RGBA", code: "0, 0, 255, 1" }
];

let colors = [];

function setCookie(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(cname) === 0) {
            return JSON.parse(c.substring(cname.length, c.length));
        }
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    const savedColors = getCookie("colorPalette");
    if (savedColors){
        colors = savedColors;
    }
    else {
        colors = defaultColors;
        setCookie("colorPalette", colors, 3);
    }
    render();
    document.getElementById("colorForm").addEventListener("submit", handleFormSubmit);
});

function render(){
    const paletteContainer = document.getElementById("palette");
    if (!paletteContainer) {return};
    paletteContainer.innerHTML = "";

    colors.forEach(color => {
        const card = document.createElement("div");
        card.className = "color-card";
        
        let cssColor = color.code;
        if (color.type === "RGB") cssColor = `rgb(${color.code})`;
        if (color.type === "RGBA") cssColor = `rgba(${color.code})`;
        
        card.innerHTML = `
            <div class="color-box" style="background-color: ${cssColor};"></div>
            <div class="color-info">
                <div class="name">${color.name}</div>
                <div class="type">${color.type}</div>
                <div class="code">${color.code}</div>
            </div>
        `;
        paletteContainer.appendChild(card);
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById("colorName").value.trim();
    const typeInput = document.getElementById("colorType").value;
    const codeInput = document.getElementById("colorCode").value.trim();
    const nameError = document.getElementById("nameError");
    const codeError = document.getElementById("codeError");
    
    nameError.textContent = "";
    codeError.textContent = "";
    let isValid = true;
    
    if (!nameInput) {
        nameError.textContent = "This field is required.";
        isValid = false;
    } else {
        let isLettersOnly = true;
        const validLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < nameInput.length; i++) {
            if (validLetters.indexOf(nameInput[i]) === -1) {
                isLettersOnly = false;
                break;
            }
        }

        if (!isLettersOnly) {
            nameError.textContent = "The name must contain letters only.";
            isValid = false;
        } else {
            const isDuplicate = colors.some(c => c.name.toLowerCase() === nameInput.toLowerCase());
            if (isDuplicate) {
                nameError.textContent = "A color with this name already exists.";
                isValid = false;
            }
        }
    }
    
    if (!codeInput) {
        codeError.textContent = "This field is required.";
        isValid = false;
    } else {
        if (typeInput === "RGB") {
            const parts = codeInput.split(',');
            if (parts.length !== 3) {
                codeError.textContent = "RGB format: 3 numbers separated by commas (e.g. 255, 0, 100).";
                isValid = false;
            } else {
                const r = parts[0].trim();
                const g = parts[1].trim();
                const b = parts[2].trim();
                
                let isAllNumbers = true;
                const digits = "0123456789";
                
                [r, g, b].forEach(str => {
                    if (str === "") isAllNumbers = false;
                    for (let i = 0; i < str.length; i++) {
                        if (digits.indexOf(str[i]) === -1) {
                            isAllNumbers = false;
                        }
                    }
                });
                
                if (!isAllNumbers) {
                    codeError.textContent = "RGB format: 3 numbers separated by commas (e.g. 255, 0, 100).";
                    isValid = false;
                } else {
                    const rNum = parseInt(r, 10);
                    const gNum = parseInt(g, 10);
                    const bNum = parseInt(b, 10);
                    
                    if (rNum < 0 || rNum > 255 || gNum < 0 || gNum > 255 || bNum < 0 || bNum > 255) {
                        codeError.textContent = "Each RGB number must be between 0 and 255.";
                        isValid = false;
                    }
                }
            }
        } 
        else if (typeInput === "RGBA") {
            const parts = codeInput.split(',');
            if (parts.length !== 4) {
                codeError.textContent = "RGBA format: 4 numbers separated by commas, last from 0 to 1 (e.g. 0, 0, 0, 0.5).";
                isValid = false;
            } else {
                const r = parts[0].trim();
                const g = parts[1].trim();
                const b = parts[2].trim();
                const a = parts[3].trim();
                
                let isFirst3Numbers = true;
                const digits = "0123456789";
                
                [r, g, b].forEach(str => {
                    if (str === "") isFirst3Numbers = false;
                    for (let i = 0; i < str.length; i++) {
                        if (digits.indexOf(str[i]) === -1) {
                            isFirst3Numbers = false;
                        }
                    }
                });
                
                const isAlphaValid = a !== "" && !isNaN(a);
                
                if (!isFirst3Numbers || !isAlphaValid) {
                    codeError.textContent = "RGBA format: 4 numbers separated by commas, last from 0 to 1 (e.g. 0, 0, 0, 0.5).";
                    isValid = false;
                } else {
                    const rNum = parseInt(r, 10);
                    const gNum = parseInt(g, 10);
                    const bNum = parseInt(b, 10);
                    const aNum = parseFloat(a);
                    
                    if (rNum < 0 || rNum > 255 || gNum < 0 || gNum > 255 || bNum < 0 || bNum > 255) {
                        codeError.textContent = "The first 3 numbers must be between 0 and 255.";
                        isValid = false;
                    } else if (aNum < 0 || aNum > 1) {
                        codeError.textContent = "The last RGBA number (alpha) must be between 0 and 1.";
                        isValid = false;
                    }
                }
            }
        } 
        else if (typeInput === "HEX") {
            if (!codeInput.startsWith('#') || codeInput.length !== 7) {
                codeError.textContent = "HEX format: # symbol followed by 6 hex characters (e.g. #FF0055).";
                isValid = false;
            } else {
                const hexPart = codeInput.slice(1);
                const hexChars = "0123456789abcdefABCDEF";
                let isHexCharacters = true;
                
                for (let i = 0; i < hexPart.length; i++) {
                    if (hexChars.indexOf(hexPart[i]) === -1) {
                        isHexCharacters = false;
                        break;
                    }
                }
                
                if (!isHexCharacters) {
                    codeError.textContent = "HEX format: # symbol followed by 6 hex characters (e.g. #FF0055).";
                    isValid = false;
                }
            }
        }
    }
    
    if (isValid) {
        const newColor = {
            name: nameInput,
            type: typeInput,
            code: codeInput
        };
        colors.push(newColor);
        setCookie("colorPalette", colors, 3);
        render();
        document.getElementById("colorForm").reset();
    }
}