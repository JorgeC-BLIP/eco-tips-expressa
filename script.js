const tipInput = document.getElementById('tipInput');
const getTipButton = document.getElementById('getTipButton');
const resultsDiv = document.getElementById('results');
const resultText = document.getElementById('resultText');
const loadingIndicator = document.getElementById('loadingIndicator');
const menuButtons = document.querySelectorAll('.menu-button'); // Select all menu buttons

// Your Gemini API key
// IMPORTANT: In a real-world application, avoid exposing API keys directly in client-side code.
// Use a backend proxy to securely handle API calls.
const apiKey = "AIzaSyATZX17prPtljBZly3U8bbJMRDUyvq2d9o";

// Function to fetch and display EcoTip
async function fetchEcoTip(prompt) {
    // Show loading indicator and hide previous results
    loadingIndicator.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
    resultText.textContent = ''; // Clear previous text

    try {
        let chatHistory = [];
        // Ensure the prompt sent to the API does not include "Inteligente" if it's from "Reciclaje Inteligente"
        let apiPrompt = prompt.replace(' Inteligente', '');
        chatHistory.push({ role: "user", parts: [{ text: `Genera un EcoTip conciso y útil sobre el tema: ${apiPrompt}.` }] });

        const payload = { contents: chatHistory };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            resultText.textContent = `Error al obtener el EcoTip: ${errorData.error?.message || 'Error desconocido'}.`;
            resultsDiv.classList.remove('hidden');
            return;
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            resultText.textContent = text;
            // Trigger confetti when a new tip is successfully displayed
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            resultText.textContent = "No se pudo generar un EcoTip para ese tema. Intenta con otro.";
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        resultText.textContent = "Ocurrió un error al conectar con el servicio. Por favor, inténtalo de nuevo.";
    } finally {
        // Hide loading indicator and show results
        loadingIndicator.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
    }
}

// Event listener for the main "Obtener EcoTip" button
getTipButton.addEventListener('click', async () => {
    const userPrompt = tipInput.value.trim();
    if (!userPrompt) {
        resultText.textContent = "Por favor, ingresa un tema para obtener un EcoTip.";
        resultsDiv.classList.remove('hidden');
        return;
    }
    // If the user types "Reciclaje Inteligente", remove " Inteligente" before sending to API
    const cleanedPrompt = userPrompt.replace(' Inteligente', '');
    fetchEcoTip(cleanedPrompt);
});

// Event listeners for the new menu buttons
menuButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Use the data-topic for the input field, but clean it for the API call
        const topicForInput = button.dataset.topic;
        const topicForApi = button.dataset.cleanTopic || topicForInput; // Use data-clean-topic if available, else data-topic

        tipInput.value = topicForInput; // Set the input field value
        fetchEcoTip(topicForApi); // Trigger the API call with the cleaned topic
    });
});
