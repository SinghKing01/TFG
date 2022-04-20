import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import BootstrapTable from 'react-bootstrap-table-next';


const Table = (props) => {
    return (
        <BootstrapTable
            keyField="id"
            data={props.data}
            columns={props.columns}
            bordered={false}
        />
    )
}

export default Table