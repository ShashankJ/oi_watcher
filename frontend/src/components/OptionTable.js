import React from 'react';

function OptionTable({data}) {
    if (!data || !data.calls || !data.puts) {
        return <div>Loading...</div>;
    }

    let arrow = null;
    let total_call_oi_change = data["Call OI Change"];
    let total_put_oi_change = data["Put OI Change"];
    if (total_put_oi_change > total_call_oi_change) {
        arrow = <span style={{color: 'green', marginLeft: 8}}>&#9650;</span>; // ▲
    } else if (total_call_oi_change > total_put_oi_change) {
        arrow = <span style={{color: 'red', marginLeft: 8}}>&#9660;</span>; // ▼
    } else {
        arrow = <span style={{color: 'blue', marginLeft: 8}}>&#9679;</span>; // ●
    }

    return (
        <div>
            <h2>OI change table</h2>
            <table>
                <thead>
                <tr>
                    <th>Strike Price</th>
                    <th>Call OI Change</th>
                    <th>Put OI Change</th>
                </tr>
                </thead>
                <tbody>
                {data.calls.map((call, idx) => (
                    <tr key={call.instrument_key}>
                        <td>{call.strike_price}</td>
                        <td>{call.oi_change}</td>
                        <td>{data.puts[idx] ? data.puts[idx].oi_change : '-'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <h2>Total change in Call and PUT OI</h2>
            <h3> CALL OI Change: {data["Call OI Change"]}</h3>
            <h3> PUT OI Change: {data["Put OI Change"]}</h3>
            <h3>Signal {arrow}</h3>
        </div>
    );
}

export default OptionTable;
