
let queryString = window.location.search;
let params = new URLSearchParams(queryString)
let id = params.get('id');
console.log(id);
let imgs = []
let path = ''
let navs = document.getElementById('v-pills-tab')
let tabContent= document.getElementById('v-pills-tabContent')
console.log();
// Function to fetch the JSON data


async function fetchJSONData() {
    let products = []
    await fetch('../assets/json/effects.json')
        .then(response => response.json())
        .then(data => {
            // Access the 'products' array
            products = data.products;
            console.log(products);
            if(products){
                $('body').css("overflow", "hidden")
                $(document).ready(function(){
                    $('.loading').fadeOut(3000, function(){
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



    
    
    
}
fetchJSONData()

