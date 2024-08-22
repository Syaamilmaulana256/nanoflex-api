document.addEventListener("DOMContentLoaded", function() {
    // Fungsi untuk smooth scroll ke elemen target
    function scrollToSection(sectionId) {
        const targetElement = document.querySelector(sectionId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });
        }
    }

    // Cek jika ada hash di URL saat halaman dimuat
    if (window.location.hash) {
        scrollToSection(window.location.hash);
    }

    // Event listener untuk setiap klik link yang mengandung hash
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            event.preventDefault();

            const targetSection = this.getAttribute('href');
            history.pushState(null, null, targetSection);
            scrollToSection(targetSection);
        });
    });
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
