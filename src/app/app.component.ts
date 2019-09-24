import { Component, OnInit } from '@angular/core';
declare var posenet;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
    title = 'Hackathon';
    selectedShirt = '1';
    net;
    constructor () {}
    async ngOnInit () {
        const net = await posenet
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
        shirtPart.style.left = 15 + leftS.position.x - diffWidth * 0.4 + 'px';
    }
}
