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

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

class PromptSaveParameters(BaseModel):
    prompt: str

class MetadataSaveParameters(BaseModel):
    sql_metadata: str

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
    return result

@app.post("/save/prompt")
async def save_prompt_data(body_data:PromptSaveParameters):
    data = body_data.prompt
    nfile=open("prompt.md","w")
    nfile.write(data)
    nfile.close()
    return {"status":"OK"}

@app.post("/save/metadata")
async def save_metadata_data(body_data:MetadataSaveParameters):
    data = body_data.sql_metadata
    nfile=open("metadata.sql","w")
    nfile.write(data)
    nfile.close()
    return {"status":"OK"}




