import { injectSpeedInsights } from '@vercel/speed-insights';
 
injectSpeedInsights();
document.addEventListener("DOMContentLoaded", function() {
    const ctaBtn = document.querySelector(".cta-btn");
    
    ctaBtn.addEventListener("click", function() {
        document.querySelector('#documentation').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });

    const navLinks = document.querySelectorAll("nav ul li a");

    navLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const targetId = this.getAttribute("href");
            document.querySelector(targetId).scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    });

    // Event Listener for "Cobalah Sekarang" section
    const sendRequestBtn = document.getElementById('sendRequest');
    const resultDiv = document.getElementById('result');
  
    sendRequestBtn.addEventListener('click', function() {
        const url = document.getElementById('url').value;

        fetch(url, {
            method: 'GET'
        })
        .then(response => {
            return response.json().then(data => ({status: response.status, data: data}));
        })
        .then(result => {
            if (result.status >= 200 && result.status < 300) {
                resultDiv.classList.remove('error');
                resultDiv.classList.add('success');
                resultDiv.innerHTML = `${JSON.stringify(result.data, null, 2)}`;
            } else {
                throw new Error(`Error ${result.status}: ${JSON.stringify(result.data)}`);
            }
        })
        .catch(error => {
            resultDiv.classList.remove('success');
            resultDiv.classList.add('error');
            resultDiv.innerHTML = `<code>${error.message}</code>`;
        });
    });
});
