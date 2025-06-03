import Reservation from "@/models/Reservation";
import { connectToDatabase } from "./mongodb";

export async function updateReservationStatus(id, status) {
  await connectToDatabase();
  await Reservation.findByIdAndUpdate(id, { status });
}
