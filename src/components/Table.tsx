import React from "react";
import {
  Table,
  TableContainer,
  Paper,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
} from "@mui/material";

interface Props {
  keys: string[];
  data: { [key: string]: any }[];
}

export default function T({ keys, data }: Props) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {keys.map((d) => (
              <TableCell key={d}>{d}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((d, i) => (
            <TableRow key={"tb-" + i}>
              {keys.map((key, j) => (
                <TableCell key={"tc-" + i + "-" + j}>{d[key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
