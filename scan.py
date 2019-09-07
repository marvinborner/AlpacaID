from __future__ import print_function

import cv2
import numpy as np

MAX_MATCHES = 500
GOOD_MATCH_PERCENT = 0.15


def align_images(im1, im2):
    im1_gra = cv2.cvtColor(im1, cv2.COLOR_BGR2GRAY)
    im2_gray = cv2.cvtColor(im2, cv2.COLOR_BGR2GRAY)

    orb = cv2.ORB_create(MAX_MATCHES)
    keypoints1, descriptors1 = orb.detectAndCompute(im1_gra, None)
    keypoints2, descriptors2 = orb.detectAndCompute(im2_gray, None)

    matcher = cv2.DescriptorMatcher_create(cv2.DESCRIPTOR_MATCHER_BRUTEFORCE_HAMMING)
    matches = matcher.match(descriptors1, descriptors2, None)

    matches.sort(key=lambda x: x.distance, reverse=False)

    num_good_matches = int(len(matches) * GOOD_MATCH_PERCENT)
    matches = matches[:num_good_matches]

    im_matches = cv2.drawMatches(im1, keypoints1, im2, keypoints2, matches, None)
    cv2.imwrite("matches.jpg", im_matches)

    points1 = np.zeros((len(matches), 2), dtype=np.float32)
    points2 = np.zeros((len(matches), 2), dtype=np.float32)

    for i, match in enumerate(matches):
        points1[i, :] = keypoints1[match.queryIdx].pt
        points2[i, :] = keypoints2[match.trainIdx].pt

    h, mask = cv2.findHomography(points1, points2, cv2.RANSAC)

    height, width, channels = im2.shape
    im1_reg = cv2.warpPerspective(im1, h, (width, height))

    return im1_reg, h


if __name__ == '__main__':
    ref_filename = "mask.jpg"
    print("Reading reference image : ", ref_filename)
    im_reference = cv2.imread(ref_filename, cv2.IMREAD_COLOR)
    im_filename = "example.jpg"
    print("Reading image to align : ", im_filename)
    im = cv2.imread(im_filename, cv2.IMREAD_COLOR)
    print("Aligning images ...")
    im_req, h = align_images(im, im_reference)
    out_filename = "aligned.jpg"
    print("Saving aligned image : ", out_filename)
    cv2.imwrite(out_filename, im_req)
    print("Estimated homography : \n", h)
