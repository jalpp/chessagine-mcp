
import { Chess, Color, Square } from "chess.js";
import { getPiecePlacement } from "./piecePlacement";
import { SideSquareControl } from "../types";

export function getSideSquareControl(chess: Chess, side: Color): SideSquareControl {
   const placement = getPiecePlacement(chess, side);
   const lightSquares: string[] = [];
   const darkSquares: string[] =  [];

   const allSquares = [...placement.knightplacement, ...placement.bishopplacement, ...placement.pawnplacement, ...placement.queenplacement, ...placement.rookplacement, ...placement.kingplacement];

   for(const square of allSquares){
     if(chess.squareColor(square as Square) === "light"){
       lightSquares.push(square);
     }else {
      darkSquares.push(square);
     }

   }

   return {
    lightSquareControl: lightSquares.length,
    darkSqaureControl: darkSquares.length,
    lightSquares: lightSquares,
    darkSquares: darkSquares
   }


 }
