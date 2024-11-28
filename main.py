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

import SQLQueryManager

sqlManager = SQLQueryManager.SQLQueryGenerator()
sqlManager.initialize()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")



class PromptSaveParameters(BaseModel):
    prompt: str

class MetadataSaveParameters(BaseModel):
    sql_metadata: str

class QueryFetchParameters(BaseModel):
    question: str

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
    prompt_file=open("prompt.md","r")
    result['prompt'] = prompt_file.read()
    prompt_file.close()
    metadata_file=open("metadata.sql","r")
    result['sql_metadata'] = metadata_file.read()
    metadata_file.close()
    result["sql_db_connection_info"]={}
    result["sql_db_connection_info"]['host'] = sqlManager.host
    result["sql_db_connection_info"]['port'] = sqlManager.port
    result["sql_db_connection_info"]['user'] = sqlManager.user
    result["sql_db_connection_info"]['password'] = sqlManager.password
    result["sql_db_connection_info"]['database'] = sqlManager.database
    result["sql_db_connection_info"]['connection_status'] = False
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




