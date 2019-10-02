from sklearn.datasets import load_files
from keras.utils import np_utils
import numpy as np
from glob import glob
from keras.layers import Conv2D, MaxPooling2D, GlobalAveragePooling2D
from keras.layers import Dropout, Flatten, Dense
from keras.models import Sequential
import tensorflow as tf
from keras.callbacks import ModelCheckpoint

############################### STEP 0. Import Databases #######################################

# define function to load train, test, and validation datasets
def load_dataset(path):
    data = load_files(path)
    dog_files = np.array(data['filenames'])
    dog_targets = np_utils.to_categorical(np.array(data['target']), 133)
    return dog_files, dog_targets

train_files, train_targets = load_dataset('C:/Users/jesus/Desktop/DogFinder/dogImages/train')
valid_files, valid_targets = load_dataset('C:/Users/jesus/Desktop/DogFinder/dogImages/valid')
test_files, test_targets = load_dataset('C:/Users/jesus/Desktop/DogFinder/dogImages/test')
#train_files, train_targets = load_dataset('C:/Users/jesus/Desktop/DogFinder_data/dog-breed-identification/train')

# load list of dog names
dog_names = [item[20:-1] for item in sorted(glob("C:/Users/jesus/Desktop/DogFinder/dogImages/train/*/"))]

# print statistics about the dataset
print('There are %d total dog categories.' % len(dog_names))
print('There are %s total dog images.\n' % len(train_files))

import random
random.seed(8675309)

# load filenames in shuffled human dataset
human_files = np.array(glob("C:/Users/jesus/Desktop/DogFinder/lfw/*/*"))
random.shuffle(human_files)

# print statistics about the dataset
print('There are %d total human images.' % len(human_files))

############################### STEP 1. Detect humans #######################################

import cv2
import matplotlib.pyplot as plt

# extract pre-trained face detector
face_cascade = cv2.CascadeClassifier('C:/Users/jesus/Desktop/DogFinder/haarcascade_frontalface_alt.xml')

# load color (BGR) image
print(human_files[5])

img = cv2.imread(human_files[5])
# convert BGR image to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# find faces in image
faces = face_cascade.detectMultiScale(gray)

# print number of faces detected in the image
print('Number of faces detected:', len(faces))

# get bounding box for each detected face
for (x, y, w, h) in faces:
    # add bounding box to color image
    cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)

# convert BGR image to RGB for plotting
cv_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# display the image, along with bounding box
plt.imshow(cv_rgb)
plt.show()


# returns "True" if face is detected in image stored at img_path
def face_detector(img_path):
    img = cv2.imread(img_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray)
    return len(faces) > 0


human_files_short = human_files[:100]
dog_files_short = train_files[:100]
# Do NOT modify the code above this line.

## TODO: Test the performance of the face_detector algorithm
## on the images in human_files_short and dog_files_short.

# List for saving human and dog faces
human_faces = 0
dog_faces = 0

for imgPath in human_files_short:
    if(face_detector(imgPath)):
        human_faces += 1

for imgPath in dog_files_short:
    if(face_detector(imgPath)):
        dog_faces += 1

print("The % human faces detected: {} %".format((human_faces/len(human_files_short)) * 100))
print("The % dog faces detected: {} %".format((dog_faces/len(dog_files_short)) * 100))

############################### STEP 2. Detect dogs #######################################


from keras.applications.resnet50 import ResNet50

# define ResNet50 model
ResNet50_model_pre = ResNet50(weights='imagenet')

from keras.preprocessing import image
from tqdm import tqdm

def path_to_tensor(img_path):
    # loads RGB image as PIL.Image.Image type
    img = image.load_img(img_path, target_size=(224, 224))
    # resize to normalize data size
    #convert PIL.Image.Image type to 3D tensor with shape (224, 224, 3)
    x = image.img_to_array(img)
    # convert 3D tensor to 4D tensor with shape (1, 224, 224, 3) and return 4D tensor
    return np.expand_dims(x, axis=0)

def paths_to_tensor(img_paths):
    list_of_tensors = [path_to_tensor(img_path) for img_path in tqdm(img_paths)]
    return np.vstack(list_of_tensors)

from keras.applications.resnet50 import preprocess_input, decode_predictions

def ResNet50_predict_labels(img_path):
    # returns prediction vector for image located at img_path
    img = preprocess_input(path_to_tensor(img_path))
    return np.argmax(ResNet50_model_pre.predict(img))

### returns "True" if a dog is detected in the image stored at img_path
def dog_detector(img_path):
    prediction = ResNet50_predict_labels(img_path)
    return ((prediction <= 268) & (prediction >= 151))

### TODO: Test the performance of the dog_detector function
### on the images in human_files_short and dog_files_short.

# List for saving human and dog faces
human_file = 0
dog_file = 0

for imgPath in human_files_short:
    if(dog_detector(imgPath)):
        human_file += 1

for imgPath in dog_files_short:
    if(dog_detector(imgPath)):
        dog_file += 1

print("The % dog faces detected in human_files: {} %".format((human_file/len(human_files_short)) * 100))
print("The % dog faces detected in dog_files: {} %".format((dog_file/len(dog_files_short)) * 100))

############################### STEP 3. Create a CNN to Classify Dog Breeds #######################################

from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

# pre-process the data for Keras

#divide_dog_files = np.split(dog_files,2)

#dog_tensors_1 = paths_to_tensor(divide_dog_files[1:]).astype('float32')/255
#dog_tensors_2 = paths_to_tensor(divide_dog_files[:1]).astype('float32')/255

#dog_tensors = np.concatenate(dog_tensors_1, dog_tensors_2)

# pre-process the data for Keras
train_tensors = paths_to_tensor(train_files).astype('float32')/255
valid_tensors = paths_to_tensor(valid_files).astype('float32')/255
test_tensors = paths_to_tensor(test_files).astype('float32')/255

train_tensors.shape[1:]



model = Sequential()

### TODO: Define your architecture.
model.add(Conv2D(filters=16, kernel_size=2, strides=1, padding='same', activation='relu', input_shape=train_tensors.shape[1:]))
model.add(MaxPooling2D(pool_size=2))
model.add(Conv2D(filters=32, kernel_size=2, strides=1, padding= 'same', activation='relu'))
model.add(MaxPooling2D(pool_size=2))
model.add(Conv2D(filters=64, kernel_size=2, strides=1, padding= 'same', activation='relu'))
model.add(MaxPooling2D(pool_size=2))

model.add(Dropout(0.2))
model.add(Flatten())
model.add(Dense(500, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(133, activation='softmax'))

model.summary()

model.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])

from keras.callbacks import ModelCheckpoint

### TODO: specify the number of epochs that you would like to use to train the model.

epochs = 15

### Do NOT modify the code below this line.

checkpointer = ModelCheckpoint(filepath='C:/Users/jesus/Desktop/DogFInder/dogImages/saved_models/weights.best.from_scratch.hdf5',
                               verbose=1, save_best_only=True)

model.fit(train_tensors, train_targets,
          validation_data=(valid_tensors, valid_targets),
          epochs=epochs, batch_size=20, callbacks=[checkpointer], verbose=1)


# get index of predicted dog breed for each image in test set
dog_breed_predictions = [np.argmax(model.predict(np.expand_dims(tensor, axis=0))) for tensor in test_tensors]

# report test accuracy
test_accuracy = 100*np.sum(np.array(dog_breed_predictions)==np.argmax(test_targets, axis=1))/len(dog_breed_predictions)
print('Test accuracy: %.4f%%' % test_accuracy)

############################### STEP 4. Use a CNN to Classify Dog Breeds #######################################

model = tf.keras.models.load_model('dogfinder_new_way.h5')

bottleneck_features = np.load('C:/Users/jesus/Desktop/DogFinder/dogImages/bottleneck/DogVGG16Data.npz')
train_VGG16 = bottleneck_features['train']
valid_VGG16 = bottleneck_features['valid']
test_VGG16 = bottleneck_features['test']

VGG16_model = Sequential()
VGG16_model.add(GlobalAveragePooling2D(input_shape=train_VGG16.shape[1:]))
VGG16_model.add(Dense(133, activation='softmax'))

VGG16_model.summary()

VGG16_model.compile(loss='categorical_crossentropy', optimizer='rmsprop', metrics=['accuracy'])

checkpointer = ModelCheckpoint(filepath='C:/Users/jesus/Desktop/DogFinder/dogImages/saved_models/weights.best.VGG16.hdf5',
                               verbose=1, save_best_only=True)

VGG16_model.fit(train_VGG16, train_targets,
          validation_data=(valid_VGG16, valid_targets),
          epochs=20, batch_size=20, callbacks=[checkpointer], verbose=1)

# get index of predicted dog breed for each image in test set
VGG16_predictions = [np.argmax(VGG16_model.predict(np.expand_dims(feature, axis=0))) for feature in test_VGG16]

# report test accuracy
test_accuracy = 100*np.sum(np.array(VGG16_predictions)==np.argmax(test_targets, axis=1))/len(VGG16_predictions)
print('Test accuracy: %.4f%%' % test_accuracy)

############################### STEP 5. Create a CNN to Classify Dog Breeds (using Transfer Learning) #######################################

from keras.layers import Conv2D, MaxPooling2D, GlobalAveragePooling2D
from keras.layers import Dropout, Flatten, Dense
from keras.models import Sequential
from sklearn.datasets.samples_generator import make_blobs
from sklearn.preprocessing import MinMaxScaler


# Trying with different pre-trained
bottleneck_features = np.load('C:/Users/jesus/Desktop/DogFinder/dogImages/bottleneck/DogResnet50Data.npz')
train_ResNet50 = bottleneck_features['train']
valid_ResNet50 = bottleneck_features['valid']
test_ResNet50 = bottleneck_features['test']

#train_ResNet50, train_targets = make_blobs(n_samples=133, centers=4, n_features=4, random_state=1)
#scalar = MinMaxScaler()
#scalar.fit(train_ResNet50)
#train_ResNet50 = scalar.transform(train_ResNet50)

ResNet50_model = Sequential()
ResNet50_model.add(GlobalAveragePooling2D(input_shape=train_ResNet50.shape[1:]))
ResNet50_model.add(Dense(133, activation='softmax'))

ResNet50_model.summary()

ResNet50_model.compile(loss='categorical_crossentropy', optimizer='rmsprop', metrics=['accuracy'])

### TODO: Train the model.
# from keras.callbacks import ModelCheckpoint

from keras.callbacks import ModelCheckpoint

checkpointer = ModelCheckpoint(filepath='C:/Users/jesus/Desktop/DogFinder/dogImages/saved_models/weights.best.ResNet50.hdf5',
                               verbose=1, save_best_only=True)

ResNet50_model.fit(train_ResNet50, train_targets,
          validation_data=(valid_ResNet50, valid_targets),
          epochs=30, batch_size=20, callbacks=[checkpointer], verbose=1)

### TODO: Calculate classification accuracy on the test dataset.

# get index of predicted dog breed for each image in test set
ResNet50_predictions = [np.argmax(ResNet50_model.predict(np.expand_dims(feature, axis=0))) for feature in test_ResNet50]

# report test accuracy
test_accuracy = 100*np.sum(np.array(ResNet50_predictions)==np.argmax(test_targets, axis=1))/len(ResNet50_predictions)
print('Test accuracy: %.4f%%' % test_accuracy)

model.save('dogfinder_new_way.h5')
ResNet50_model.save('dogfinder_resnet50_133.h5')

from extract_bottleneck_features import *

def ResNet50_predict_breed(img_path):
    # extract bottleneck features
    bottleneck_feature = extract_Resnet50(path_to_tensor(img_path))
    # obtain predicted vector
    predicted_vector = ResNet50_model.predict(bottleneck_feature)
    # return dog breed that is predicted by the model
    return dog_names[np.argmax(predicted_vector)]

print("Prediction using ResNet50: {}".format(ResNet50_predict_breed('C:/Users/jesus/Desktop/DogFinder/dogImages/full_train/001.Affenpinscher/n02110627_13710.jpg')))

def dog_breed_classifier(img_path):
    '''
    INPUT:
        img_path: path for the image to be classified

    OUTPUT:
        print type of image classified such as Human or dog and breed name
    '''

    # Verifying for human face or dog detector
    is_human = face_detector(img_path)
    is_dog = dog_detector(img_path)

    # classifying the breed of dog
    breed = ResNet50_predict_breed(img_path)

    img = cv2.imread(img_path)
    cv_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    plt.imshow(cv_rgb)
    plt.show()

    # When dog is detected
    if is_dog:
        print("Detected a dog. Breed is: {}".format(breed))

    # When the face detected is human
    elif is_human:
        print("Detected a human. If you were dog then your breed is: {}".format(breed))

    else:
        print("Unknown species")


dog_breed_classifier('C:/Users/jesus/Desktop/DogFinder/dogImages/full_train/001.Affenpinscher/n02110627_13710.jpg')
