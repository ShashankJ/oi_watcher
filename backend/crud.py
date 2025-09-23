from sqlalchemy.orm import Session
from . import models

def save_option_data(db: Session, option_data_list: list[models.OptionData]):
    """
    Saves a list of OptionData objects to the database.
    """
    db.add_all(option_data_list)
    db.commit()

def get_latest_option_data(db: Session):
    """
    Retrieves the most recent batch of option data from the database.
    """
    latest_timestamp = db.query(models.OptionData.timestamp).order_by(models.OptionData.timestamp.desc()).first()
    if latest_timestamp:
        return db.query(models.OptionData).filter(models.OptionData.timestamp == latest_timestamp[0]).all()
    return []
