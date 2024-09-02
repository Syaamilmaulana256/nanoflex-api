document.addEventListener("DOMContentLoaded", function() {
    // Smooth scroll function
    function scrollToSection(sectionId) {
        const targetElement = document.querySelector(sectionId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });
        }
    }

    // Scroll to section if URL hash exists on load
    if (window.location.hash) {
        scrollToSection(window.location.hash);
    }

    // Event listeners for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            event.preventDefault();
            const targetSection = this.getAttribute('href');
            history.pushState(null, null, targetSection);
            scrollToSection(targetSection);
        });
    });

    const ctaBtn = document.getElementById("cta-btn");
    ctaBtn.addEventListener("click", function() {
        document.querySelector('#documentation').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });

    const sendRequestBtn = document.getElementById('sendRequest');
    const urlInput = document.getElementById('url');
    const resultDiv = document.querySelector('.result');
    const methodSelect = document.getElementById('method');
    const postBodyContainer = document.getElementById('postBodyContainer');
    const postBody = document.getElementById('postBody');
    const urlError = document.getElementById('urlError');

    // Toggle POST body container based on method selection
    methodSelect.addEventListener('change', function() {
        if (this.value === 'POST') {
            postBodyContainer.classList.remove('hidden');
        } else {
            postBodyContainer.classList.add('hidden');
        }
    });

    // Enable/disable sendRequest button based on URL input
    urlInput.addEventListener('input', function() {
        if (urlInput.value.trim() !== '') {
            sendRequestBtn.disabled = false;
            urlError.classList.add('hidden');
        } else {
            sendRequestBtn.disabled = true;
            urlError.classList.remove('hidden');
        }
    });

    // Send request button click event
    sendRequestBtn.addEventListener('click', function() {
        const url = urlInput.value.trim();
        const method = methodSelect.value;
        const body = method === 'POST' ? postBody.value.trim() : null;

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : null
        })
        .then(response => {
            return response.json().then(data => ({status: response.status, data: data}));
        })
        .then(result => {
            if (result.status >= 200 && result.status < 300) {
                resultDiv.classList.remove('error');
                resultDiv.classList.add('success');
                resultDiv.textContent = `${JSON.stringify(result.data, null, 2)}`;
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
