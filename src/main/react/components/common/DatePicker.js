// DatePicker.js
import React from 'react';
import '../../../resources/static/css/common/DatePicker.css';

function DatePicker({ label, value, onChange, minDate = null }) {
    return (
        <div className="form-group">
            <label>{label}<span style={{ color: 'red', marginLeft: '1px' }}>*</span></label>
            <input
                type="date"
                className="box"
                value={value.toISOString().split('T')[0]} // 날짜 형식 일치
                min={minDate}
                onChange={(e) => onChange(new Date(e.target.value))}
            />
        </div>
    );
}

export default DatePicker;
