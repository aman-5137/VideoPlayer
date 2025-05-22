function player(){

    const video = document.getElementById('vid');
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = ""; 
  //
  
  // 
    fetch('/list-videos')
      .then(res => res.json())
      .then(videos => {
        videos.forEach(file => {
          const li = document.createElement('li');
          const videoName = file.replace(/\.(mkv|mp4)$/i, "");

          const nameSpan = document.createElement('span');
          nameSpan.textContent = videoName;
          nameSpan.style.cursor = "pointer";


          li.addEventListener('click', () => {
            document.getElementById('div-1-video-name').innerHTML = videoName;
            video.src = `/videos/${file}`;
            video.play();
          });


          // this is how we customize html tags in javascript
          const deleteBtn = document.createElement('img');
          deleteBtn.src = "assets/trash.png";
          deleteBtn.alt = "Delete";
          deleteBtn.style.width = "20px";
          deleteBtn.style.height = "20px";
          deleteBtn.style.cursor = "pointer";
          deleteBtn.style.marginLeft = "10px";
          deleteBtn.className = "bin-icon";
          deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); 
            if (confirm(`Delete "${videoName}"?`)) {
              const response = await fetch(`/delete-video/${encodeURIComponent(file)}`, { method: "DELETE" });
              if (response.ok) {
                showCustomAlert("Video deleted.");
                player(); // refreshing playlist
              } else {
                showCustomAlert("Failed to delete video.");
              }
            }
          });

          li.appendChild(nameSpan);
          li.appendChild(deleteBtn);
          playlist.appendChild(li);
        });

        if (videos.length > 0) {
          const firstVideoName = videos[0].replace(/\.(mkv|mp4)$/i, "");
          document.getElementById('div-1-video-name').innerHTML = firstVideoName;
          video.src = `/videos/${videos[0]}`;
        }
      });
}
player();


async function uploadVideo(event) {
  if (event) event.preventDefault(); 


  
  // took stackover flow help to prevent default

  const fileInput = document.getElementById('video-upload-input');
      const file = fileInput.files[0];

      if (!file) {
        showCustomAlert("Please select a video file first.");
        return;
      }

      const formData = new FormData();
      formData.append("video", file);

      try {
        const response = await fetch("/upload-video", {
          method: "POST",
          body: formData,
        });


        // refresh the page after upload is sucessful
        if (response.ok) {
          showCustomAlert("Video is Uploaded>");
          fileInput.value = ""; 
          playlist.innerHTML = ""; 
          player(); 
        } else {
          showCustomAlert("Upload failed!");
        }
      } catch (error) {
        console.error("Error while Uploading", error);
        showCustomAlert("Errror while uploading the file. Exception");
      }
}

// adding an eventlistner to input filr to upload video
document.getElementById('video-upload-input').addEventListener('change', uploadVideo);
function showCustomAlert(message) {
  const alertBox = document.getElementById('custom-alert');
  const alertMsg = document.getElementById('custom-alert-message');
  alertMsg.textContent = message;
  alertBox.style.display = 'flex';
}

function closeCustomAlert() {
  document.getElementById('custom-alert').style.display = 'none';
}

