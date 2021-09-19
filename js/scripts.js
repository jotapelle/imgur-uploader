const templateRowTable = "<tr id='{{id}}'><td>{{id}}</td><td><a href='{{link}}' target='_blank'>{{link}}</a></td><td><a id='{{id}}' data-delete-hash='{{deleteHash}}' onclick='deleteRow(this)' class='cursor-pointer teal'><i class='bi bi-trash-fill'></i></a></td></tr>";
const clientID = 'YOUR_CLIENT_ID'; 

$("#btnUpload").click(function (ev) {
    ev.preventDefault();;
    const fileInput = document.getElementById('file');
    if (fileInput.files.length == 0) {
        showModal('File empty');
    }
    else {
        const reader = new FileReader();
        reader.readAsDataURL(fileInput.files[0]);
        reader.onload = function () {
            uploadImage(reader.result);
        };
        reader.onerror = function (error) {
            showModal(error);
        };
    }
})

const uploadImage = (image) => {
    const replacedImage = image.replace("data:image/png;base64,", "");
    $.ajax({
        url: 'https://api.imgur.com/3/image',
        type: 'POST',
        headers: {
            Authorization: 'Client-ID ' + clientID,
            Accept: 'application/json'
        },
        data: {
            image: replacedImage,
            type: 'base64'
        },
        success: function(result) {
            if (result.success && result.status == 200) {
                fillTable(result.data.id, result.data.link, result.data.deletehash)
            }
            else {
                showModal('Error uploading file');
            }
            $("#file").val("");
        }
    });
}

const fillTable = (id, link, deleteHash) => {
    $("#response").val(link);
    $("#noData").hide();
    const newRow = templateRowTable.replaceAll("{{id}}", id)
                                   .replaceAll("{{link}}", link)
                                   .replaceAll("{{deleteHash}}", deleteHash);
    $("#tableBody").append(newRow);
}

const deleteRow = (ev) => {
    const imageId = ev.id;
    const codeHash = ev.dataset.deleteHash;
    $.ajax({
        url: "https://api.imgur.com/3/image/" + codeHash,
        type: "DELETE",
        headers: {
            "Authorization": "Client-ID " + clientID
        },
        success: function(result) {
            if (result.success && result.status == 200) {
                $("#" + imageId).remove();
                $("#response").val("");
                if ($("#tableBody > tr").length == 1) {
                    $("#noData").show();
                }
            }
            else {
                showModal('Error deleting file');
            }
        }
    });
}

const showModal = (text) => {
    $("#modalText").text(text);
    $('#errorModal').modal('show');
}