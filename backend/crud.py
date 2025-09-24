from sqlalchemy.orm import Session
import models


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

def get_previous_oi(db: Session, instrument_key: str):
    """
    Retrieves the most recent OI for a given instrument key, to calculate the change.
    """
    latest_record = db.query(models.OptionData).filter(models.OptionData.instrument_key == instrument_key).order_by(models.OptionData.timestamp.desc()).first()
    if latest_record:
        return latest_record.oi
    return None
