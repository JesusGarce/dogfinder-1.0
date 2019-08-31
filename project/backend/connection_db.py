import psycopg2
import re

def select_breed(breed_id):
    connection = False
    dog_breed = ""

    try:
        print("Breed_id: ", breed_id)
        id = breed_id[0]

        connection = psycopg2.connect(user="dogfinder",
                                  password="8SzAfB8a",
                                  host="127.0.0.1",
                                  port="5432",
                                  database="dogfinder-db")
        cursor = connection.cursor()
        postgreSQL_select_Query = "select * from dog_breeds where id = %s"
        cursor.execute(postgreSQL_select_Query, (breed_id,))
        print("Selecting rows from mobile table using cursor.fetchall")
        dog_breed = cursor.fetchall()

        print("Print each row and it's columns values")
        for row in dog_breed:
            print("Name = ", row[0], )
            print("Image = ", row[1])
            print("Weight  = ", row[2], "\n")
    except (Exception, psycopg2.Error) as error:
            print("Error while fetching data from PostgreSQL", error)
    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")
            return dog_breed

