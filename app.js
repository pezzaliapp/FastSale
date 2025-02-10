document.addEventListener("DOMContentLoaded", function () {
    caricaDatiSalvati();
});

// Funzione per aggiungere un articolo
function aggiungiArticolo() {
    const container = document.getElementById("articoli-container");
    const idUnico = Date.now();

    const div = document.createElement("div");
    div.classList.add("articolo");
    div.innerHTML = `
        <details id="articolo-${idUnico}">
            <summary>Nuovo Articolo</summary>
            <label>Codice: <input type="text" class="codice" oninput="aggiornaTitolo(this, ${idUnico})"></label>
            <label>Descrizione: <input type="text" class="descrizione"></label>
            <label>Prezzo Lordo (€): <input type="number" class="prezzoLordo" step="0.01" oninput="calcolaPrezzo(this)"></label>
            <label>Sconto (%): <input type="number" class="sconto" step="0.01" oninput="calcolaPrezzo(this)"></label>
            <label>Prezzo Netto (€): <input type="text" class="prezzoNetto" readonly></label>
            <label>Quantità: <input type="number" class="quantita" step="1" oninput="calcolaPrezzo(this)"></label>
            <label>Prezzo Totale (€): <input type="text" class="prezzoTotale" readonly></label>
            <button onclick="salvaArticolo(${idUnico})">Salva</button>
            <button onclick="rimuoviArticolo(this)">Rimuovi</button>
        </details>
    `;

    container.appendChild(div);
}

// Aggiorna il nome dell'articolo con il codice inserito
function aggiornaTitolo(input, id) {
    const summary = document.querySelector(`#articolo-${id} summary`);
    summary.textContent = input.value || "Nuovo Articolo";
}

// Salva un articolo e chiude il menu a tendina
function salvaArticolo(id) {
    document.getElementById(`articolo-${id}`).open = false;
    salvaDati();
}

// Rimuove un articolo e aggiorna i dati
function rimuoviArticolo(btn) {
    btn.parentElement.parentElement.remove();
    salvaDati();
}

// Calcola il prezzo netto e totale degli articoli
function calcolaPrezzo(input) {
    const row = input.closest(".articolo");
    const prezzoLordo = parseFloat(row.querySelector(".prezzoLordo").value) || 0;
    const sconto = parseFloat(row.querySelector(".sconto").value) || 0;
    const quantita = parseInt(row.querySelector(".quantita").value) || 1;

    const prezzoNetto = prezzoLordo * (1 - sconto / 100);
    const prezzoTotale = prezzoNetto * quantita;

    row.querySelector(".prezzoNetto").value = prezzoNetto.toFixed(2);
    row.querySelector(".prezzoTotale").value = prezzoTotale.toFixed(2);
    
    aggiornaTotaleGenerale();
}

// Aggiorna il totale degli articoli
function aggiornaTotaleGenerale() {
    let totaleGenerale = 0;
    document.querySelectorAll(".prezzoTotale").forEach(input => {
        totaleGenerale += parseFloat(input.value) || 0;
    });

    document.getElementById("totaleArticoli").textContent = `Totale Articoli: ${totaleGenerale.toFixed(2)}€`;
    calcolaMarginalita();
}

// Calcola il totale con marginalità
function calcolaMarginalita() {
    const totaleArticoli = parseFloat(document.getElementById("totaleArticoli").textContent.replace(/[^0-9.,]/g, "")) || 0;
    const margine = parseFloat(document.getElementById("margine").value) || 0;

    let nuovoTotale = totaleArticoli;
    if (margine > 0) {
        nuovoTotale = totaleArticoli / (1 - margine / 100);
    }
    
    document.getElementById("totaleMarginalita").textContent = `Nuovo Totale Articoli: ${nuovoTotale.toFixed(2)}€`;
    calcolaTotaleFinale();
}

// Calcola il totale finale considerando trasporto e installazione
function calcolaTotaleFinale() {
    const nuovoTotale = parseFloat(document.getElementById("totaleMarginalita").textContent.replace(/[^0-9.,]/g, "")) || 0;
    const costoTrasporto = parseFloat(document.getElementById("costoTrasporto").value) || 0;
    const costoInstallazione = parseFloat(document.getElementById("costoInstallazione").value) || 0;

    const totaleFinale = nuovoTotale + costoTrasporto + costoInstallazione;
    document.getElementById("totaleFinale").textContent = `Totale Finale: ${totaleFinale.toFixed(2)}€`;
}

// Genera il PDF con o senza i codici articolo
function generaPDF() {
    let contenuto = "Preventivo FastSale\n\n";
    const mostraCodici = document.getElementById("mostraCodici").checked;

    if (mostraCodici) {
        contenuto += "Elenco Articoli:\n";
        document.querySelectorAll(".articolo").forEach(articolo => {
            const codice = articolo.querySelector(".codice").value;
            const descrizione = articolo.querySelector(".descrizione").value;
            contenuto += `- Codice: ${codice}, Descrizione: ${descrizione}\n`;
        });
        contenuto += "\n";
    }

    contenuto += document.getElementById("totaleFinale").textContent + "\n";

    const blob = new Blob([contenuto], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "preventivo.txt";
    a.click();

    URL.revokeObjectURL(url);
}

// Invia i dati su WhatsApp con lo stesso formato del PDF
function inviaWhatsApp() {
    let testo = "Preventivo FastSale:\n\n";
    const mostraCodici = document.getElementById("mostraCodici").checked;

    if (mostraCodici) {
        testo += "Elenco Articoli:\n";
        document.querySelectorAll(".articolo").forEach(articolo => {
            const codice = articolo.querySelector(".codice").value;
            const descrizione = articolo.querySelector(".descrizione").value;
            testo += `- Codice: ${codice}, Descrizione: ${descrizione}\n`;
        });
        testo += "\n";
    }

    testo += document.getElementById("totaleFinale").textContent + "\n";

    const encodedText = encodeURIComponent(testo);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    window.open(whatsappUrl, "_blank");
}
