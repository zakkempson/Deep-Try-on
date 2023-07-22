
let queryString = window.location.search;
let params = new URLSearchParams(queryString)
let id = params.get('id');
console.log(id);
let productImage = ''
let path = ''
let navs = document.getElementById('v-pills-tab')
let homeTap = document.getElementById("rn-pd-thumbnail")
let tap2 = document.getElementById('v-pills-profile')
let tap3 = document.getElementById('v-pills-messages')
let tabContent = document.getElementById('v-pills-tabContent')
// Function to fetch the JSON data


async function fetchJSONData() {
    let products = []
    await fetch('assets/json/effects.json')
        .then(response => response.json())
        .then(data => {
            // Access the 'products' array
            products = data.products;
            console.log(products);
            if (products) {
                $('body').css("overflow", "hidden")
                $(document).ready(function () {
                    $('.loading').fadeOut(3000, function () {
                        $('body').css("overflow", "auto")
                    })
                })
            }
        })
        .catch(error => {
            console.error('Error fetching JSON data:', error);
        });
    let product = products.find((product) => {
        return product.id == id
    })
    productImage = product.img;
    homeTap.firstElementChild.src = productImage;
    let link = document.createElement('a')
    link.href = `camera.html?id=${product.id}`
    link.innerHTML = "Try on Model"
    link.classList.add('link')
    tabContent.appendChild(link)
    document.querySelector('.prod-title').innerHTML = product.productName
    document.querySelector('.prod-price').innerHTML += product.price
    document.querySelector('.prod-desc').innerHTML += product.desc
    document.querySelector('.prod-likes').innerHTML = product.likes
    document.querySelector('#qr-img').setAttribute('src', `${product.qrImg}`)

}
fetchJSONData()

document.getElementById('try-on-btn').addEventListener('click', () => {
    document.getElementById('qr-conatiner').classList.toggle('d-none')
})

document.getElementById('qr-overlay').addEventListener('click', () => {
    document.getElementById('qr-conatiner').classList.add('d-none')
})