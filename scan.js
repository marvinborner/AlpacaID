const cv = require("opencv4nodejs");

class FinderPattern {
    constructor(a, b, c) {
        this.topLeft = new cv.Point(a);
        this.topRight = new cv.Point(b);
        this.bottomLeft = new cv.Point(c);
    }
}

function compareContourAreas(contour1, contour2) {
    return contour1.area > contour2.area;
}

function getContourCenter(vec) {
    let x = 0.0;
    let y = 0.0;
    for (let i = 0; i < vec.size(); i++) {
        x += vec[i].x;
        y += vec[i].y;
    }
    return new cv.Point(x / vec.size(), y / vec.size())
}

function isContourInsideContour(cont_in, cont_out) {
    for (let i = 0; i < cont_in.size(); i++) {
        if (cont_out.pointPolygonTest(cont_in[i]) <= 0) return false;
    }
    return true;
}

function findLimitedContours(contour, minPix, maxPix) {
    const contours = contour.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
    console.log(contours.size());
    let m = 0;
    while (m < contours.size()) {
        if (contours[m].area <= minPix) {
            contours.erase(contours.begin())
        } else if (contours[m].area > maxPix) {
            contours.erase(contours.begin())
        } else ++m;
    }
    console.log(contours.size());
    return contours;
}

function getContourPair(contours) {
    let vectorPair = [];
    let flags = Array(contours.size()).fill(false);
    for (let i = 0; i < contours.size() - 1; i++) {
        if (flags[i]) continue;
        let temp = new cv.Contour();
        temp.push_back(contours[i]);
        for (let j = i + 1; j < contours.size(); j++) {
            if (isContourInsideContour(contours[j], contours[i])) {
                temp.push_back(contours[j]);
                flags[j] = true;
            }
        }
        if (temp.size() > 1) {
            vectorPair.push(temp)
        }
    }
    flags.clear();
    for (let i = 0; i < vectorPair.length; i++) {
        vectorPair[i] = vectorPair[i].sort((a, b) => compareContourAreas(a, b))
    }
    return vectorPair;
}

function eliminatePairs(vectorPair, minRatio, maxRatio) {
    console.log(maxRatio);
    let flag = false;
    let m = 0;
    while (m < vectorPair.size()) {
        flag = false;
        if (vectorPair[m].size() < 3) {
            vectorPair.erase(vectorPair.begin() + m);
            continue;
        }
        for (let i = 0; i < vectorPair[m].size() - 1; i++) {
            const area1 = vectorPair[m][i].area;
            const area2 = vectorPair[m][i + 1].area;
            if (area1 / area2 < minRatio || area1 / area2 > maxRatio) {
                vectorPair.erase(vectorPair.begin() + m);
                flag = true;
                break;
            }
        }
        if (!flag) {
            ++m;
        }
    }
    if (vectorPair.size() > 3) {
        eliminatePairs(vectorPair, minRatio, maxRatio * 0.9)
    }
}

function getDistance(a, b) {
    return Math.sqrt(((a.x - b.x) ** 2) + (a.y - b.y) ** 2);
}

function getFinderPattern(vectorPair) {
    const point1 = getContourCenter(vectorPair[0][vectorPair[0].size() - 1]);
    const point2 = getContourCenter(vectorPair[1][vectorPair[1].size() - 1]);
    const point3 = getContourCenter(vectorPair[2][vectorPair[2].size() - 1]);
    const distance1 = getDistance(point1, point2);
    const distance2 = getDistance(point1, point3);
    const distance3 = getDistance(point2, point3);
    let x1, y1, x2, y2, x3, y3, p1, p2, p3;
    const Max = Math.max.apply(Math, [distance1, distance2, distance3]);
    if (Max === distance1) {
        p1 = point1;
        p2 = point2;
        p3 = point3;
    } else if (Max === distance2) {
        p1 = point1;
        p2 = point3;
        p3 = point2;
    } else {
        p1 = point2;
        p2 = point3;
        p3 = point1;
    }
    x1 = p1.x;
    y1 = p1.y;
    x2 = p2.x;
    y2 = p2.y;
    x3 = p3.x;
    y3 = p3.y;
    if(x1 === x2){
        if(y1 > y2){
            if(x3 < x1){
                return FinderPattern(p3, p2, p1);
            }else{
                return FinderPattern(p3, p1, p2);
            }
        }else{
            if(x3 < x1){
                return FinderPattern(p3, p1, p2);
            }else{
                return FinderPattern(p3, p2, p1);
            }
        }
    }else{
        let newY = (y2 - y1) / (x2 - x1) * x3 + y1 - (y2 - y1) / (x2 - x1) * x1;
        if(x1 > x2){
            if(newY < y3){
                return FinderPattern(p3, p2, p1);
            }else{
                return FinderPattern(p3, p1, p2);
            }
        }else{
            if(newY < y3){
                return FinderPattern(p3, p1, p2);
            }else{
                return FinderPattern(p3, p2, p1);
            }
        }
    }
}

const ori = cv.imread("./example.jpg");
const gray = ori.cvtColor(cv.COLOR_GRAY2BGR);
let canny = new cv.Mat;
gray.copyTo(canny);
const bin = gray.threshold(0, 255, cv.THRESH_OTSU);
let contour = new cv.Mat;
bin.copyTo(contour);
let contours = findLimitedContours(contour, 8.00, 0.2 * ori.cols * ori.rows);


if(!contours.empty()) contours = contours.sort((a, b) => compareContourAreas(a, b));
const vectorPair = getContourPair(contours);
eliminatePairs(vectorPair, 1.0, 10.0);
fPattern = getFinderPattern(vectorPair);
let drawing = new cv.Mat;
ori.copyTo(drawing);

drawing.drawCircle(fPattern.topLeft, 3, new cv.Vec3(255, 0, 0), 2, 8, 0);
drawing.drawCircle(fPattern.topRight, 3, new cv.Vec3(0,255,0), 2, 8, 0);
drawing.drawCircle(fPattern.bottomLeft, 3, new cv.Vec3(0,0,255), 2, 8, 0);

let vectorSource = [new cv.Point2(0, 0)];
let vectorDestination = [new cv.Point2(0, 0)];
vectorSource.push(fPattern.topLeft);
vectorSource.push(fPattern.topRight);
vectorSource.push(fPattern.bottomLeft);
vectorDestination.push(new cv.Point2(20, 20));
vectorDestination.push(new cv.Point2(120, 20));
vectorDestination.push(new cv.Point2(20, 120));
const affineTrans = cv.getAffineTransform(vectorSource, vectorDestination);
const warped = ori.warpAffine(affineTrans, ori.size());
const qrColor = warped(new cv.Rect(0, 0, 140, 140));
const qrColorGray = qrColor.cvtColor(cv.COLOR_GRAY2RGB);
const qrBin = qrColorGray.threshold(0, 255, cv.THRESH_OTSU);

cv.imshow("binary", bin);
cv.imshow("canny", canny);
cv.imshow("finder patterns", drawing);
cv.imshow("binaried qr code", qrBin);
cv.waitKey();
