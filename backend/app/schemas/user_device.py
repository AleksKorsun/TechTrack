# schemas/user_device.py

from pydantic import BaseModel

class UserDeviceCreate(BaseModel):
    device_id: str
    push_token: str
