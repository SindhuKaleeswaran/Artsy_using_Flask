document.addEventListener("DOMContentLoaded", function () {
    const searchIcon = document.getElementById("search_operation");
    const searchInput = document.getElementById("artist_id");
    const container = document.querySelector(".container");
    const artistDetail = document.querySelector(".artist_detail");
    const loadingGIF = document.getElementById("loading_gif");
    const artistNotFound = document.getElementById("artistNotFound");
    
    searchInput.addEventListener("keypress" , function (event) {
        if (event.key === "Enter") {
            searchIcon.click();
        }
    });
    document.getElementById('search_form').addEventListener('submit', function(event) {
        event.preventDefault();
    });
    searchIcon.addEventListener("click" , function () {
        let query = searchInput.value.trim();
        if (!query) {
            return;
        }
        document.querySelector(".container").classList.add("active");
        artistNotFound.style.display = "none";
        artistDetail.style.display = "none";
        loadingGIF.style.display = "block";
        if (container.style.display === "flex") {
            loadingGIF.style.top = '70%';
        }
        fetch(`/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            container.innerHTML = "";

            if(data.length === 0){
                artistNotFound.style.display = "block";
                container.style.display = "none";
                loadingGIF.style.display = "block";
                loadingGIF.style.top = '20%';
                return;
            }
            artistNotFound.style.display = "none";
            container.style.display = "flex";
            loadingGIF.style.top = '70%';
            
            data.forEach(artist => {
                let div = document.createElement("div");
                div.className = "holder";
                div.id = artist.id;
                let imgDiv = document.createElement("div");
                imgDiv.className = "artistImage";
                let img = document.createElement("img");
                if (artist.image.includes("missing_image")){
                    img.src = "/static/images/artsy_logo.svg";
                }else{
                    img.src = artist.image;
                }
                //img.alt = artist.id;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.borderRadius = "50%";
                imgDiv.appendChild(img);

                let nameDiv = document.createElement("div");
                nameDiv.className = "artistName";
                nameDiv.textContent = artist.name;

                div.appendChild(imgDiv);
                div.appendChild(nameDiv);
                container.appendChild(div);
            });
            })
            .catch(error => console.error("Error fetching artists:", error))
            .finally(() => {
                loadingGIF.style.display = "none";
                if(container.style.display === "flex"){
                    loadingGIF.style.top = '70%';
                }
            });
            
    });

    document.getElementById("clear_input").addEventListener("click" , function() {
        document.getElementById("artist_id").value = "";
    });

    container.addEventListener("click", function(event) {
        loadingGIF.style.display = "block";
        loadingGIF.style.top = '70%';
        
        artistDetail.style.display = "none";
        let clickedElement = event.target.closest(".holder");
        if(!clickedElement) return;

        const allHolders = document.querySelectorAll(".container .holder");
        allHolders.forEach(holder => {
            holder.classList.remove("clicked");
        });
        
        clickedElement.classList.add("clicked");

        let artistID = clickedElement.id;
    
        fetch('/artists', {
            method : 'POST',
            headers : {'Content-Type': 'application/json'},
            body : JSON.stringify({artist_id : artistID})
        })
        .then(response => response.json())
        .then(data => {
            artistDetail.innerHTML = "";
    
            let divArtistName = document.createElement("div");
            divArtistName.className = "artist_name_period";
            divArtistName.textContent = `${data.name} (${data.birthday} - ${data.deathday})`;
    
            let divNationality = document.createElement("div");
            divNationality.className = "nationality";
            divNationality.textContent = `${data.nationality || ""}`;
    
            let divBiography = document.createElement("div");
            divBiography.className = "biography";
            divBiography.textContent = data.biography || "";
    
            artistDetail.appendChild(divArtistName);
            artistDetail.appendChild(divNationality);
            artistDetail.appendChild(divBiography);
        })
        .catch(error => console.error("Error fetching artist details:", error))
        .finally(() => {
            loadingGIF.style.display = "none";
            artistDetail.style.display = "block";
        });
    });
});
