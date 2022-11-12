document.addEventListener('DOMContentLoaded', () => {
  formData = document.getElementById('login-form');
  formData.addEventListener('click', () => {
    username = document.getElementById('username')
    password = document.getElementById('password')
    console.log(`${username.value} & ${password.value}`)
  })
})

document.addEventListener('DOMContentLoaded', () => {
  formData = document.getElementById('create-account');
  formData.addEventListener('click', () => {
    extraData = document.getElementById('changeAccount');
    if(extraData.className.includes('hidden')){
      extraData.className = extraData.className.replace('hidden', 'visible')
    }
    else{
      extraData.className = extraData.className.replace('visible', 'hidden')
    }
  })
})

document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("navbar");
  if (element) {
    element.addEventListener("click", navbarClick);
  }
});

function navbarClick(event) {
  let activeTabs = document.querySelectorAll(".active");
  if (!event.target.name) return;

  activeTabs.forEach((tab) => {
    tab.className = tab.className.replace("active", "");
  });

  event.target.parentElement.className += " active";
  document.getElementById(event.target.href.split("#")[1]).className +=
    " active";
}