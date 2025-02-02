#define _CRT_SECURE_NO_DEPRECATE
#include "Application.h"
#include <FL/fl_file_chooser.H>
#include "Gui.h"

extern Gui *gui;
Image curImage; // make inImage a global, need it in other classes
Volume vol;
double bbx[2];
double bby[2];
double bbz[2];
bool usingboundingbox = false;
double t1 = 0.0, t2 = 0.0;
double origin[3] = { 0.0, 0.0, 0.0 };
double direction[3] = { 0.0, 0.0, 1.0 };
struct Point3D {
	double x, y, z;
};

struct Vector3D {
	double x, y, z;
};

// Define the Ray structure
struct Ray {
	Point3D origin;
	Vector3D direction;
};

// the constructor method for the Application class
Application::Application()
{
  // initialize the image data structure
  curImage.nx=curImage.ny=curImage.n=curImage.ncolorChannels=0;

  // add more initialization here:
  vol.nx = vol.ny = vol.nz = vol.n = 0; vol.data = NULL;
}


// p is the starting position, ray is the ray direction vector
	// return t_front and t_back
double Application::vIntersectRaywithVolumeBoundingBox(double p[3], double ray[3], double& t_front, double& t_back)
{
	double bbx0, bbx1, bby0, bby1, bbz0, bbz1;	// bounding box
	double dev;
	bool useboundingbox = true;
	double t1, t2, mint, maxt;
	double tmin, tmax;

	// define vol
	t_front = -1e10;
	t_back = 1e10;
	dev = 0.0001;
	if (useboundingbox) {
		bbx0 = bbx[0] - dev;	bbx1 = bbx[1] + dev;
		bby0 = bby[0] - dev;	bby1 = bby[1] + dev;
		bbz0 = bbz[0] - dev;	bbz1 = bbz[1] + dev;
	}
	else {						    //vol
		bbx0 = 0 + dev;		bbx1 = vol.nx - 1 - dev;
		bby0 = 0 + dev;		bby1 = vol.ny - 1 - dev;
		bbz0 = 0 + dev;		bbz1 = vol.nz - 1 - dev;
	}

	if (fabs(ray[0]) <= 1e-5) {
		if (p[0]<bbx0 || p[0]>bbx1)
			return t_front, t_back;
	}
	if (fabs(ray[1]) <= 1e-5) {
		if (p[1]<bby0 || p[1]>bby1)
			return t_front, t_back;
	}
	if (fabs(ray[2]) <= 1e-5) {
		if (p[2]<bbz0 || p[2]>bbz1)
			return t_front, t_back;
	}
	if (fabs(ray[0]) > 1e-5) {	// intersect with bbx
		t1 = (bbx0 - p[0]) / ray[0];
		t2 = (bbx1 - p[0]) / ray[0];
		mint = min(t1, t2);
		maxt = max(t1, t2);
		t_front = max(mint, t_front);
		t_back = min(maxt, t_back);
	}
	if (fabs(ray[1]) > 1e-5) {	// intersect with bby
		t1 = (bby0 - p[1]) / ray[1];
		t2 = (bby1 - p[1]) / ray[1];
		mint = min(t1, t2);
		maxt = max(t1, t2);
		t_front = max(mint, t_front);
		t_back = min(maxt, t_back);
	}
	if (fabs(ray[2]) > 1e-5) {	// intersecgt with bbz
		t1 = (bbz0 - p[2]) / ray[2];
		t2 = (bbz1 - p[2]) / ray[2];
		mint = min(t1, t2);
		maxt = max(t1, t2);
		t_front = max(mint, t_front);
		t_back = min(maxt, t_back);
	}
	return t_front, t_back;
}

void  Application::ReadVolume() {
	int n;
	FILE* fp;
	char imageType[20], str[100];

	char* fn = fl_file_chooser("Specify a filename to READ from", "*.{vol}", "");
	if (fn == NULL)
		return;

	int nx = vol.nx;
	int ny = vol.ny;
	int nz = vol.nz;
	unsigned char* involume = NULL;

	fp = fopen(fn, "rb");
	fgets(str, 100, fp);
	sscanf(str, "%s", imageType);
	if (!strncmp(imageType, "P7", 2)) { // volume data
		// skip comments embedded in header
		fgets(str, 100, fp);
		while (str[0] == '#')
			fgets(str, 100, fp);
		// read volume dimensions 
		sscanf(str, "%d %d %d", &nx, &ny, &nz);
		n = nx * ny * nz;

		fgets(str, 100, fp);

		involume = (unsigned char*)malloc(n * sizeof(unsigned char));
		fread(involume, sizeof(unsigned char), n, fp);
	}
	fclose(fp);
	vol.nx = nx;
	vol.ny = ny;
	vol.nz = nz;
	vol.data = involume;
	// the intersection is returned as a pair of t values (t1,t2) such that the intersection points are:
	vIntersectRaywithVolumeBoundingBox(origin, direction, t1, t2);

	gui->DisplayWindow->redraw();
	gui->EditorWindow->redraw();
}

void Application::GenerateMipImage()
{
	// Initialize dimensions for the volume and output image
	int volumeWidth = vol.nx;
	int volumeHeight = vol.ny;
	int volumeDepth = vol.nz;
	curImage.nx = volumeWidth;
	curImage.ny = volumeHeight;
	curImage.n = volumeWidth * volumeHeight;
	curImage.ncolorChannels = 1;
	curImage.data = new unsigned char[curImage.n * curImage.ncolorChannels];

	// Iterate through each pixel in the output image
	for (int pixelX = 0; pixelX < volumeWidth; ++pixelX) {
		for (int pixelY = 0; pixelY < volumeHeight; ++pixelY) {
			double maxVoxelValue = 0.0;

			// Set up ray parameters
			double rayStart = 0.0, rayEnd = 200.0;
			int rayStep = 1;

			// Define the ray originating at the pixel
			Ray currentRay;
			currentRay.origin.x = pixelX;
			currentRay.origin.y = pixelY;
			currentRay.origin.z = 0;

			currentRay.direction.x = 0;
			currentRay.direction.y = 0;
			currentRay.direction.z = 1;

			// Traverse the ray through the volume
			for (double rayPosition = rayStart; rayPosition <= rayEnd; rayPosition += rayStep) {
				int sampleX = static_cast<int>(currentRay.origin.x + rayPosition * currentRay.direction.x);
				int sampleY = static_cast<int>(currentRay.origin.y + rayPosition * currentRay.direction.y);
				int sampleZ = static_cast<int>(currentRay.origin.z + rayPosition * currentRay.direction.z);

				// Ensure the sample point is within the volume bounds
				if (sampleX >= 0 && sampleX < volumeWidth &&
					sampleY >= 0 && sampleY < volumeHeight &&
					sampleZ >= 0 && sampleZ < volumeDepth) {
					double voxelValue = vol.data[sampleZ * volumeWidth * volumeHeight + sampleY * volumeWidth + sampleX] / 255.0;
					if (voxelValue > maxVoxelValue) {
						maxVoxelValue = voxelValue;
					}
				}
			}

			// Save the highest intensity value to the output image
			curImage.data[pixelY * volumeWidth + pixelX] = static_cast<unsigned char>(maxVoxelValue * 255.0);
		}
	}

	// Refresh the GUI to reflect the changes
	gui->DisplayWindow->redraw();
	gui->EditorWindow->redraw();
}

void Application::CreateXRayProjection()
{
	// Setup dimensions for the volume and output image
	int imageWidth = vol.nx;
	int imageHeight = vol.ny;
	int imageDepth = vol.nz;
	curImage.nx = imageWidth;
	curImage.ny = imageHeight;
	curImage.n = imageWidth * imageHeight;
	curImage.ncolorChannels = 1;
	curImage.data = new unsigned char[curImage.n * curImage.ncolorChannels];

	// Process each pixel in the output image
	for (int pixelX = 0; pixelX < imageWidth; ++pixelX) {
		for (int pixelY = 0; pixelY < imageHeight; ++pixelY) {
			Ray currentRay;
			currentRay.origin.x = pixelX;
			currentRay.origin.y = pixelY;
			currentRay.origin.z = 0;

			currentRay.direction.x = 0;
			currentRay.direction.y = 0;
			currentRay.direction.z = 1;

			float totalVoxelValue = 0.0f;

			// Traverse through the volume along the ray
			for (int depth = 0; depth < imageDepth; ++depth) {
				int sampleX = static_cast<int>(currentRay.origin.x);
				int sampleY = static_cast<int>(currentRay.origin.y);
				int sampleZ = depth;

				if (sampleX >= 0 && sampleX < imageWidth &&
					sampleY >= 0 && sampleY < imageHeight &&
					sampleZ >= 0 && sampleZ < imageDepth) {
					totalVoxelValue += vol.data[sampleZ * imageWidth * imageHeight + sampleY * imageWidth + sampleX] / 255.0f;
				}
			}

			// Compute the average intensity and save it to the output image
			curImage.data[pixelY * imageWidth + pixelX] = static_cast<unsigned char>(totalVoxelValue * 255.0f / imageDepth);
		}
	}

	// Update the GUI to display the new image
	gui->DisplayWindow->redraw();
	gui->EditorWindow->redraw();
}
