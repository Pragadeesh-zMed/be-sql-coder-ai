from ollama import Client
import time
class zOllama:
    def __init__(self,ollama_server,ollama_model):
        self.ollama_server = "http://164.52.198.84:11434"
        self.ollama_model = ollama_model
        self.client = Client(host=self.ollama_server)
    
    def sendMessage(self,messages):
        start_time = time.time()
        response = self.client.chat(model=self.ollama_model, messages=messages)
        end_time = time.time()
        self.ai_chat_response_duration = int((end_time-start_time)*1000)
        return response