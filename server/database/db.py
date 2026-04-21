import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Database:
    def __init__(self):
        self.connection = None
    
    def connect(self):
        """Establish connection to MySQL database"""
        try:
            self.connection = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                database=os.getenv('DB_NAME', 'hkgram'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', '')
            )
            if self.connection.is_connected():
                print("✅ Connected to MySQL database")
                return self.connection
        except Error as e:
            print(f"❌ Database connection error: {e}")
            return None
    
    def close(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("Database connection closed")
    
    def execute_query(self, query: str, params: tuple = None):
        """
        Execute INSERT, UPDATE, DELETE queries
        Returns last inserted ID for INSERT queries
        """
        cursor = self.connection.cursor()
        cursor.execute(query, params or ())
        self.connection.commit()
        last_id = cursor.lastrowid
        cursor.close()
        return last_id
    
    def fetch_all(self, query: str, params: tuple = None):
        """Execute SELECT query and return all results as list of dictionaries"""
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        results = cursor.fetchall()
        cursor.close()
        return results
    
    def fetch_one(self, query: str, params: tuple = None):
        """Execute SELECT query and return one result as dictionary"""
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        result = cursor.fetchone()
        cursor.close()
        return result
    
    def execute_many(self, query: str, params_list: list):
        """Execute same query with multiple parameter sets"""
        cursor = self.connection.cursor()
        cursor.executemany(query, params_list)
        self.connection.commit()
        affected = cursor.rowcount
        cursor.close()
        return affected
