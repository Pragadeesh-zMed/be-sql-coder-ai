from typing import Union

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
# import transcriber
# import speaker_diarization
# import gen_ai
import markdown
import time
import uuid
import gen_ai
import SQLQueryManager

sqlManager = SQLQueryManager.SQLQueryGenerator()
sqlManager.initialize()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")



class PromptSaveParameters(BaseModel):
    prompt: str

class MetadataSaveParameters(BaseModel):
    sql_metadata: str

class OllamaInstructionsSaveParameters(BaseModel):
    instructions: str

class QueryFetchParameters(BaseModel):
    question: str

class QueryExecutorFetchParameters(BaseModel):
    question: str
    model: str

class DBConnectionSaveParamaters(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str

@app.get("/ai/sqlcoder")
async def read_index():
    return FileResponse("public/index.html")

@app.get("/")
def read_root():
    return {"version":"1.0.0"}

@app.get("/ping")
def pong():
    return {"ping": "pong"}

@app.get("/get/all_info")
async def getAllAvailableInfo():
    result={}
    ai_server = gen_ai.zOllama('English','')
    models = ai_server.client.list()
    ollama_models = []
    for model in models.models:
        ollama_models.append(model.model)
    prompt_file=open("prompt.md","r")
    result['prompt'] = prompt_file.read()
    prompt_file.close()
    metadata_file=open("metadata.sql","r")
    result['sql_metadata'] = metadata_file.read()
    metadata_file.close()
    ollama_instruction_file=open("ollama_instruction.txt","r")
    result['ollama_instructions'] = ollama_instruction_file.read()
    ollama_instruction_file.close()
    result["sql_db_connection_info"]={}
    result["sql_db_connection_info"]['host'] = sqlManager.host
    result["sql_db_connection_info"]['port'] = sqlManager.port
    result["sql_db_connection_info"]['user'] = sqlManager.user
    result["sql_db_connection_info"]['password'] = sqlManager.password
    result["sql_db_connection_info"]['database'] = sqlManager.database
    result["sql_db_connection_info"]['connection_status'] = False
    result['ollama_models'] = ollama_models
    if sqlManager.connection:
        result["sql_db_connection_info"]['connection_status'] = True
    return result

@app.post("/save/prompt")
async def save_prompt_data(body_data:PromptSaveParameters):
    data = body_data.prompt
    nfile=open("prompt.md","w")
    nfile.write(data)
    nfile.close()
    sqlManager.setup_prompt()
    return {"status":"OK"}

@app.post("/save/metadata")
async def save_metadata_data(body_data:MetadataSaveParameters):
    data = body_data.sql_metadata
    nfile=open("metadata.sql","w")
    nfile.write(data)
    nfile.close()
    sqlManager.setup_metadata()
    return {"status":"OK"}

@app.post("/save/ollama_instructions")
async def save_ollama_instructions(body_data:OllamaInstructionsSaveParameters):
    data = body_data.instructions
    nfile=open("ollama_instruction.txt","w")
    nfile.write(data)
    nfile.close()
    return {"status":"OK"}

@app.post("/save/db/connection")
async def save_db_connection(body_data:DBConnectionSaveParamaters):
    sqlManager.host = body_data.host
    sqlManager.port = body_data.port
    sqlManager.user = body_data.user
    sqlManager.password = body_data.password
    sqlManager.database = body_data.database
    sqlManager.close_connection()
    sqlManager.connect()
    db_connected = False
    if sqlManager.connection:
        db_connected = True
    return {"status":"OK","connection_status":db_connected}

@app.post("/get/query")
async def get_query_for_the_question(body_data:QueryFetchParameters):
    query = sqlManager.getQuery(body_data.question)
    return {"query":query}

@app.post("/execute/query")
async def execute_query_for_the_question(body_data:QueryExecutorFetchParameters):
    request_received= time.time()
    question = body_data.question
    result = {}
    query_generate_start_time = time.time()
    query = sqlManager.getQuery(question)
    query_generate_end_time = time.time()
    result["query"]=query
    result["time_taken_in_ms"]={}
    result["time_taken_in_ms"]['generate_query']=int((query_generate_end_time-query_generate_start_time)*1000)
    query_execution_start_time = time.time()
    QueryResponse = sqlManager.execute_query(query)
    result["query_response"] = QueryResponse
    query_execution_end_time = time.time()
    result["time_taken_in_ms"]['query_execution']=int((query_execution_end_time-query_execution_start_time)*1000)
    ai_process_start_time = time.time()
    ai_server = gen_ai.zOllama('English',body_data.model)
    user_content = f"Question :{question} \n Answer : {QueryResponse}"
    ollama_instruction_file=open("ollama_instruction.txt","r")
    system_content = ollama_instruction_file.read()
    ollama_instruction_file.close()
    chat_data = ai_server.sendMessage([{'role': 'system','content':system_content },{'role': 'user','content':user_content }])
    ai_process_end_time = time.time()
    message_data = chat_data['message'].get('content',None)
    ai_response = ""
    if message_data is not None:
        ai_response = markdown.markdown(message_data)
    result["time_taken_in_ms"]['gen_ai_response']=int((ai_process_end_time-ai_process_start_time)*1000)
    result["response"] = ai_response
    response_constructed = time.time()
    result["time_taken_in_ms"]['total_response']=int((response_constructed-request_received)*1000)
    return result




