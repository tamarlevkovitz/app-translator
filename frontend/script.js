const btn = document.getElementById('translateBtn');
const source = document.getElementById('source');
const target = document.getElementById('target');
const result = document.getElementById('result');
const historyList = document.getElementById('history');


btn.addEventListener('click', async () => {
    const text = source.value.trim();
    const targetLang = target.value;

    if (!text){
        result.textContent = 'נא להזין טקסט לתרגום';
        return; 
    } 


    result.textContent = 'מתרגם...';
    try {
        const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, to: targetLang })
    });

    if (!res.ok) throw new Error(`שרת התרגום החזיר שגיאה (${res.status})`);
    const data = await res.json();
    result.textContent = data.translatedText || 'לא התקבל תרגום';

    loadHistory();
} catch (err) {
    console.error("Frontend Error:", err);
    result.textContent = 'שגיאה: ' + err.message;
    }
});


async function loadHistory() {
    try {
        const res = await fetch('/api/history');
        if (!res.ok) return;

        const data = await res.json();
        
        if (data.length === 0) {
            historyList.innerHTML = '<li>אין היסטוריית תרגומים</li>';
            return;
        }
        
        historyList.innerHTML = data
            .map(t => `<li><strong>${t.source_text}</strong> → ${t.translated_text}</li>`)
            .join('');
    } catch (err) {
        console.error("History Load Error:", err);
    }
}   


loadHistory();