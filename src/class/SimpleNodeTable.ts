import { Connection, Database } from "duckdb"

export default class SimpleNodeTable {
    protected table: string
    protected verbose: boolean
    protected nbRowsToLog: number
    protected db!: Database
    protected connection!: Connection

    constructor(
        table: string,
        db: Database,
        connection: Connection,
        options: { verbose?: boolean; nbRowsToLog?: number } = {
            verbose: false,
            nbRowsToLog: 10,
        }
    ) {
        this.table = table
        this.db = db
        this.connection = connection
        this.verbose = options.verbose ?? false
        this.nbRowsToLog = options.nbRowsToLog ?? 10
    }
}
