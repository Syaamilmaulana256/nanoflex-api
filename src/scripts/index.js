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
    document.querySelector('#documentation').scrollIntoView({ behavior: 'smooth' });
  });


  const sendRequestBtn = document.getElementById('sendRequest');
  const urlInput = document.getElementById('url');
  const resultDiv = document.querySelector('.result');
  const methodSelect = document.getElementById('method');
  const postBodyContainer = document.getElementById('postBodyContainer');
  const postBody = document.getElementById('postBody');
  const urlError = document.getElementById('urlError');


  methodSelect.addEventListener('change', function() {
    if (this.value === 'POST') {
      postBodyContainer.classList.remove('hidden');
    } else {
      postBodyContainer.classList.add('hidden');
      postBody.value = "";  //Clear POST body on GET selection
    }
    // Disable sendRequest button when method changes, but only if URL is invalid or empty
    sendRequestBtn.disabled = urlInput.value.trim() === "" ? true : false;
  });


  urlInput.addEventListener('input', function() {
    if (urlInput.value.trim() !== '') {
      sendRequestBtn.disabled = false; // Enable button if URL is valid
      urlError.classList.add('hidden');
    } else {
      sendRequestBtn.disabled = true; // Disable button if URL is invalid/empty
      urlError.classList.remove('hidden');
    }
  });



  sendRequestBtn.addEventListener('click', function() {
    const url = urlInput.value.trim();
    const method = methodSelect.value;
    const body = method === 'POST' ? postBody.value : null;

    url.addEventListener("change", () => {
    sendRequestBtn.disabled = !url.length > 0;
    })
    return;
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : null
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error : ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      resultDiv.textContent = JSON.stringify(data, null, 2);
      resultDiv.classList.remove("animate__shakeX");
      resultDiv.classList.add("animate__fadeIn");
    })
    .catch(error => {
      resultDiv.textContent = `Error: ${error.message}`;
      resultDiv.classList.remove("animate__fadeIn");
      resultDiv.classList.add("animate__shakeX");
    });

  });
});
