import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import os
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'
torch.cuda.empty_cache()
torch.cuda.memory_summary(device=None, abbreviated=False)
torch.cuda.set_per_process_memory_fraction(1.0, device='cuda:0')  # Use 90% of GPU 0’s memory
import pymysql
from pymysql.err import OperationalError

class SQLQueryGenerator:
    def __init__(self):
        self.model = "defog/sqlcoder-7b-2"
        self.prompt_file = "prompt.md"
        self.metadata_file = "metadata.sql"
        self.prompt_data = ""
        self.table_metadata_string = ""
        self.host = '139.5.188.48'
        self.user = 'root'
        self.password = 'ghYuwR5fg_eRfgvBm'
        self.database = 'ZMED_ALTERED'
        self.port = 3101
        self.connection = None  
        self.connect()
        
    def setup_metadata(self):
        with open(self.metadata_file, "r") as f:
            self.table_metadata_string = f.read()
    
    def setup_prompt(self):
        with open(self.prompt_file, "r") as f:
            self.prompt_data = f.read()
    
    def initialize(self):
        self.setup_prompt()
        self.setup_metadata()
    
    def generate_prompt(self,question):
        prompt = self.prompt_data.format(
            user_question=question, 
            table_metadata_string=self.table_metadata_string
            )
        return prompt
        
    def get_tokenizer_model(self,model_name):
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            trust_remote_code=True,
            torch_dtype=torch.float16,
            device_map="auto",
            use_cache=True,
            )
        return tokenizer, model
    
    def getQuery(self,question):
        tokenizer, model = self.get_tokenizer_model(self.model)
        prompt = self.generate_prompt(question)
        eos_token_id = tokenizer.eos_token_id
        pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            max_new_tokens=800000,
            do_sample=False,
            return_full_text=False, # added return_full_text parameter to prevent splitting issues with prompt
            num_beams=2, # do beam search with 5 beams for high quality results
            )
        generated_query = (
            pipe(
                prompt,
                num_return_sequences=1,
                eos_token_id=eos_token_id,
                pad_token_id=eos_token_id,
                )[0]["generated_text"]
            .split(";")[0]
            .split("```")[0]
            .strip()
            + ";"
            )
        return generated_query
    
    def connect(self):
        """Establishes a new connection to the database."""
        try:
            self.connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port
            )
            print("Connected to the database.")
        except OperationalError as e:
            print(f"Error connecting to the database: {e}")
            self.connection = None

    def execute_query(self, query, params=None):
        """
        Executes a SQL query. Reconnects automatically if the connection is lost.
        
        :param query: The SQL query string to execute.
        :param params: A tuple of parameters for the query (optional).
        :return: The result of the query for SELECT, None otherwise.
        """
        try:
            # Ensure connection is active
            if not self.connection or not self.connection.open:
                print("Reconnecting to the database...")
                self.connect()

            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                # Commit for non-SELECT queries
                if query.strip().upper().startswith("SELECT"):
                    return cursor.fetchall()
                else:
                    self.connection.commit()
                    print("Query executed and changes committed.")
        except OperationalError as e:
            print(f"Database operation failed: {e}")
            self.connect()
        except Exception as e:
            print(f"An error occurred: {e}")

    def close_connection(self):
        """Closes the database connection."""
        if self.connection:
            self.connection.close()
            self.connection = None
            print("Database connection closed.")
    
    