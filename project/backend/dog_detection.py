import tensorflow as tf
import numpy as np
from glob import glob
import cv2
import re

from project.backend.connection_db import select_breed, put_registry


# extract pre-trained face detector
face_cascade = cv2.CascadeClassifier('../haarcascade_frontalface_alt.xml')

# returns "True" if face is detected in image stored at img_path
def face_detector(img_path):

    print("Detectando caras...")

    img = cv2.imread(img_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray)
    return len(faces) > 0

dog_names = [item[20:-1] for item in sorted(glob("C:/Users/jesus/Desktop/DogFinder/dogImages/full_train/*/"))]

from keras.applications.resnet50 import ResNet50

# define ResNet50 model
ResNet50_model_pre = ResNet50(weights='imagenet')

from keras.preprocessing import image
from tqdm import tqdm

def path_to_tensor(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    return np.expand_dims(x, axis=0)

def paths_to_tensor(img_paths):
    list_of_tensors = [path_to_tensor(img_path) for img_path in tqdm(img_paths)]
    return np.vstack(list_of_tensors)

from keras.applications.resnet50 import preprocess_input, decode_predictions

def ResNet50_predict_labels(img_path):
    img = preprocess_input(path_to_tensor(img_path))
    return np.argmax(ResNet50_model_pre.predict(img))

### returns "True" if a dog is detected in the image stored at img_path
def dog_detector(img_path):

    print("Detectando perros..." + img_path)

    prediction = ResNet50_predict_labels(img_path)
    return ((prediction <= 268) & (prediction >= 151))

#ResNet50_model = tf.keras.models.load_model('project/backend/dogfinder_resnet50.h5')
ResNet50_model = tf.keras.models.load_model('backend/dogfinder_resnet50.h5')

def extract_Resnet50(tensor):
	from keras.applications.resnet50 import ResNet50, preprocess_input
	return ResNet50(weights='imagenet', include_top=False, pooling="avg").predict(preprocess_input(tensor))


def ResNet50_predict_breed(img_path):

    print("Prediciendo la imagen...")

    # extract bottleneck features
    bottleneck_feature = extract_Resnet50(path_to_tensor(img_path))

    # obtain predicted vector
    bottleneck_feature = np.expand_dims(bottleneck_feature, axis=0)
    bottleneck_feature = np.expand_dims(bottleneck_feature, axis=0)
    # obtain predicted vector
    predicted_vector = ResNet50_model.predict(bottleneck_feature)
    predicted_vector_array = predicted_vector[0]

    # return dog breed that is predicted by the model
    i=0

    predicted_ind_min = predicted_vector.argsort()[-5:]
    predicted_ind_min_array = predicted_ind_min[0]
    predicted_ind_max_array = predicted_ind_min_array[::-1]

    print("Preparando el resultado...")

    print(dog_names[predicted_ind_max_array[0]])

    output_array = []
    for i in range(5):
        percentage = round(predicted_vector_array[predicted_ind_max_array[i]]*100, 2)
        name_breed = dog_names[predicted_ind_max_array[i]][33:]
        name = re.sub("[^A-Za-z]+", ' ', name_breed)
        original_name = dog_names[predicted_ind_max_array[i]]
        id = re.findall('\d+', original_name)
        output_array.insert(i, [id, name, percentage])

    return output_array


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

    output = []

    # When dog is detected
    if is_dog:
        print("Detected a dog. Breed is: {} with a percentage of {}".format(breed[0][1], breed[0][2]))
        print("Detected a dog. Breed is: {} with a percentage of {}".format(breed[1][1], breed[1][2]))
        print("Detected a dog. Breed is: {} with a percentage of {}".format(breed[2][1], breed[2][2]))
        print("Detected a dog. Breed is: {} with a percentage of {}".format(breed[3][1], breed[3][2]))

        main_breed = select_breed(breed[0][0][0])
        second_breed = select_breed(breed[1][0][0])
        print(main_breed)
        print(second_breed)
        put_registry(1, breed[0][1], breed[0][2], breed[1][1], breed[1][2], img_path)
        return [1, breed, main_breed, second_breed]

    # When the face detected is human
    elif is_human:
        main_breed = select_breed(breed[0][0][0])
        print(main_breed)

        put_registry(2, breed[0][1], breed[0][2], breed[1][1], breed[1][2], img_path)
        return [2, breed, main_breed]
    else:
        put_registry(0, "", 0, "", 0, img_path)
        return 0

