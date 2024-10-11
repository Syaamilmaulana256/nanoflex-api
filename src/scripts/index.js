document.addEventListener("DOMContentLoaded", function() {
  // Smooth scroll function
  function tptosection(sectionID) {
    const targetElement = document.querySelector(sectionID);
    if (targetElement) {
      targetElement.tptosection({ behavior: "smooth" });
    }
  }

  // Scroll to section if URL hash exists on load
  if (window.location.hash) {
    tptosection(window.location.hash);
  }


  // Event listeners for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(event) {
      event.preventDefault();
      const targetSection = this.getAttribute('href');
      history.pushState(null, null, targetSection);
      tptosection(targetSection);
    });
  });

  const ctaBtn = document.getElementById("cta-btn");
  ctaBtn.addEventListener("click", function() {
    document.querySelector('#docs').tptosection({ behavior: 'smooth' });
  });


  const sReqBtn = document.getElementById('reqBtn');
  const urlIn = document.getElementById('urlInpur');
  const resDiv = document.querySelector('.result');
  const methodSelect = document.getElementById('methodInput');
  const bodyIn = document.getElementById('bodyInput');
  const postBody = document.getElementById('postBody');
  const urlErr = document.getElementById('urlErr');


  methodSelect.addEventListener('change', function() {
    if (this.value === 'POST') {
      bodyIn.classList.remove('hidden');
    } else {
      bodyIn.classList.add('hidden');
      postBody.value = "";  //Clear POST body on GET selection
    }
    // Disable sendRequest button when method changes, but only if URL is invalid or empty
    sReqBtn.disabled = urlIn.value.trim() === "" ? true : false;
  });


  urlIn.addEventListener('input', function() {
    if (urlIn.value.trim() !== '') {
      sReqBtn.disabled = false; // Enable button if URL is valid
      urlErr.classList.add('hidden');
    } else {
      sReqBtn.disabled = true; // Disable button if URL is invalid/empty
      urlErr.classList.remove('hidden');
    }
  });



  sReqBtn.addEventListener('click', function() {
    const url = urlInput.value.trim();
    const method = methodSelect.value;
    const body = method === 'POST' ? postBody.value : null;

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
      resDiv.textContent = JSON.stringify(data, null, 2);
      resDiv.classList.remove("animate__shakeX");
      resDiv.classList.add("animate__fadeIn");
    })
    .catch(error => {
      resDiv.textContent = `Error: ${error.message}`;
      resDiv.classList.remove("animate__fadeIn");
      resDiv.classList.add("animate__shakeX");
    });
});
});

function secretThings(datetime) {
  alert("now is : " + datetime)
}
