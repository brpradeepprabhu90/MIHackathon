import { Component, OnInit } from '@angular/core';
declare var html2canvas;
declare var posenet;
declare var $;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
    title = 'Hackathon';
    selectedShirt = '1';
    emotions;
    person = 'person1';
    net;
    sourceURL = 'https://images.bewakoof.com/t540/happy-beat-half-sleeve-t-shirt-men-s-printed-t-shirts-213829-1554277180.jpg';

    personList = [
        {
            path: 'person1',
            url: 'https://images.bewakoof.com/t540/happy-beat-half-sleeve-t-shirt-men-s-printed-t-shirts-213829-1554277180.jpg'
        },
        {
            path: 'person2',
            url:
                'https://st3.depositphotos.com/3917667/19142/i/1600/depositphotos_191428366-stock-photo-beautiful-man-looking-suprised-and.jpg'
        }
    ];
    constructor () {}
    onChange (e) {
        this.person = e;
        this.sourceURL = this.personList.find((f) => f.path === e).url;
        setTimeout(() => {
            this.estimateImagePose();
        }, 400);
    }
    checkImagePath () {
        console.log(this.person);
        return 'assets/' + this.person + '.jpg';
    }
    async ngOnInit () {
        await posenet
            .load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                inputResolution: 257,
                multiplier: 0.75
            })
            .then((net) => {
                this.net = net;
                this.estimateImagePose();
            });
    }
    processImage () {
        // Replace <Subscription Key> with your valid subscription key.
        const subscriptionKey = 'a5b7bf99e75b40c39eae44774ec9ec37';

        const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';

        // Request parameters.
        var params = {
            returnFaceId: 'true',
            returnFaceLandmarks: 'false',
            returnFaceAttributes: 'age,gender,emotion'
        };

        // Display the image.
        const sourceImageUrl = this.sourceURL; // Perform the REST API call.
        $.ajax({
            url: uriBase + '?' + $.param(params),

            // Request headers.
            beforeSend: (xhrObj) => {
                xhrObj.setRequestHeader('Content-Type', 'application/json');
                xhrObj.setRequestHeader('Ocp-Apim-Subscription-Key', subscriptionKey);
            },

            type: 'POST',

            // Request body.
            data: '{"url": ' + '"' + sourceImageUrl + '"}'
        })
            .done((data) => {
                console.log(data);
                this.emotions = data;
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                // Display error message.
                let errorString = errorThrown === '' ? 'Error. ' : errorThrown + ' (' + jqXHR.status + '): ';
                errorString +=
                    jqXHR.responseText === ''
                        ? ''
                        : $.parseJSON(jqXHR.responseText).message
                          ? $.parseJSON(jqXHR.responseText).message
                          : $.parseJSON(jqXHR.responseText).error.message;
                alert(errorString);
            });
    }
    changeShirtImage (index) {
        this.selectedShirt = index;
    }
    async estimateImagePose () {
        console.log('est', this.net);
        const imageElement = document.getElementById('image');

        const pose = await this.net.estimateSinglePose(imageElement, {
            flipHorizontal: true
        });
        console.log(pose);
        const leftS: any = pose.keypoints.find((e) => e.part === 'leftShoulder');
        const leftH = pose.keypoints.find((e) => e.part === 'leftHip');
        const rightH = pose.keypoints.find((e) => e.part === 'rightHip');
        const rightS = pose.keypoints.find((e) => e.part === 'rightShoulder');
        console.log(leftS);
        const leftSDiv = document.getElementById('lefts');
        const rightSDiv = document.getElementById('rights');
        const leftHDiv = document.getElementById('lefth');
        const rightHDiv = document.getElementById('righth');
        leftSDiv.style.left = leftS.position.x + 'px';
        leftSDiv.style.top = leftS.position.y + 'px';
        rightSDiv.style.left = rightS.position.x + 'px';
        rightSDiv.style.top = rightS.position.y + 'px';
        leftHDiv.style.left = leftH.position.x + 'px';
        leftHDiv.style.top = leftH.position.y + 'px';
        rightHDiv.style.left = rightH.position.x + 'px';
        rightHDiv.style.top = rightH.position.y + 'px';

        const diffWidth = rightS.position.x - leftS.position.x;
        const diffHeight = leftH.position.y - leftS.position.y;
        const shirtPart = document.getElementById('shirtView');
        shirtPart.style.width = diffWidth + diffWidth * 0.8 + 'px';
        shirtPart.style.height = diffHeight + diffHeight * 0.3 + 'px';
        shirtPart.style.top = leftS.position.y - 15 - diffHeight * 0.15 + 'px';
        shirtPart.style.left =  leftS.position.x - diffWidth * 0.3 + 'px';
        this.processImage();
    }
}
