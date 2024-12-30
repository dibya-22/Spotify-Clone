console.log("Hey! Its JavaScript Time.");
let currentSong = document.getElementById('currentSong');
let songs;
let currentFolder;

function formatTime(seconds) {
    seconds = Math.round(seconds);
    const minutes = Math.floor(seconds / 60); // Calculate minutes
    const remainingSeconds = seconds % 60; // Calculate remaining seconds
    // Format as MM:SS
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getFormattedSongName(song, folder) {
    return song
        .replaceAll("%20", " ")
        .split(`/songs/${folder}/`)[1]
        .split(".m4a")[0];
}

async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/Web%20Development/Projects/02_Spotify%20Clone/songs/${currentFolder}/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')

    songs = [];

    for(let i=0; i<as.length; i++){
        if(as[i].href.endsWith(".m4a")){
            songs.push(as[i].href);
        }
    }

    // filter out basePath
    songs = songs.filter(song => typeof song === "string").map(song => getFormattedSongName(song, currentFolder));

     // display songs in the library
    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = "";
    let listItems = songs.map(song => `<li><img src="assets/music.svg" alt="">
                            <div class="info">
                                <div class="songName">${song}</div>
                                <div class="artist">Dibya</div>
                            </div>
                            <img class="invert-1 play" src="assets/play.svg" alt=""></li>`).join("");
    songUl.innerHTML = listItems;

    // event listener for each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(currentFolder, e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
}

const playMusic = (folder, track, pause=false)=> {
    let basePath = `/Web Development/Projects/02_Spotify Clone/songs/${folder}/`;
    currentSong.src = basePath + track + ".m4a";
    if(!pause){
        currentSong.play();
        document.querySelector("#play-pause").src = "assets/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songTime").innerHTML = `00:00 / ${formatTime(currentSong.duration)}`;
    });
}

async function displayPlaylist() {
    let a = await fetch("http://127.0.0.1:3000/Web%20Development/Projects/02_Spotify%20Clone/songs/");
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let arr = Array.from(anchors)
    for(let i=0; i<arr.length; i++){
        const e = arr[i];
        if(e.href.includes("/Web%20Development/Projects/02_Spotify%20Clone/songs/")){
            let folder = e.href.split("/").slice(-2)[0];

            let a = await fetch(`http://127.0.0.1:3000/Web%20Development/Projects/02_Spotify%20Clone/songs/${folder}/info.json`);
            let response = await a.json();
            
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                            <div class="play-button">
                                <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"></path>
                                </svg>
                            </div>

                            <img src="songs/${folder}/cover.jpg" alt="">
                            <h2>${response.title}</h2>
                            <p>By ${response.artist}</p>
                        </div>`
        }
    }


}

async function main() {

    // get all the songs from the server
    await getSongs("Favourites");
    
    let rand = Math.floor(Math.random()*(songs.length));
    playMusic(currentFolder,songs[rand], true);

    // display all the playlists dynamically
    await displayPlaylist();

    // event listener for play, pause and next
    document.querySelector("#play-pause").addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play();
            document.querySelector("#play-pause").src = "assets/pause.svg"
        } else {
            currentSong.pause();
            document.querySelector("#play-pause").src = "assets/play.svg"
        }
    })

    // timeupdate listener
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left  = (currentSong.currentTime / currentSong.duration)*100 + "%";

        // autoplay after current song end
        let index = songs.indexOf(getFormattedSongName(currentSong.src, currentFolder));
        if (Math.abs(currentSong.currentTime - currentSong.duration) < 0.1) {
            if (index + 1 < songs.length) {
                playMusic(currentFolder, songs[index + 1]);
            } else {
                console.log("End of playlist.");
            }
        }
    })

    // event listener to seek
    document.querySelector(".seek-bar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left  = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    

    // hamburger event
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0%";
    })
    // closing hamburger event
    document.querySelector(".cross").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%";
    })

    // event listener for previous & next
    previous.addEventListener("click", ()=>{
        let index = songs.indexOf(getFormattedSongName(currentSong.src, currentFolder));
        if(index-1 >= 0){
            playMusic(currentFolder, songs[index-1]);
        }
    })
    
    next.addEventListener("click", ()=>{
        let index = songs.indexOf(getFormattedSongName(currentSong.src, currentFolder));
        if(index < songs.length-1){
            playMusic(currentFolder, songs[index+1]);
        }
    })


    // load songs of the playlist on songlist whenever the playlist is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            await getSongs(item.currentTarget.dataset.folder);
            playMusic(currentFolder,songs[0]);
        })
    })
}

main();